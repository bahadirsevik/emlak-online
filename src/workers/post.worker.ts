import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import prisma from '../config/database';
import * as instagramService from '../services/instagram.service';
import { decrypt } from '../utils/encryption.util';

export const postWorker = new Worker(
  'post-queue',
  async (job) => {
    const { postId, userId } = job.data;
    console.log(`Processing job ${job.id} for post ${postId}`);

    let post: any = null;

    try {
      // 1. Fetch Post
      post = await prisma.post.findUnique({
        where: { id: postId },
        include: { instagramAccount: true },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.status === 'PUBLISHED') {
        console.log('Post already published, skipping.');
        return;
      }

      if (!post.instagramAccount) {
        throw new Error('No Instagram account associated with this post');
      }

      // 2. Decrypt Access Token
      const accessToken = decrypt(post.instagramAccount.accessToken);
      const instagramUserId = post.instagramAccount.instagramUserId;
      const postAny = post as any;

      // Helper to apply watermark
      const getImageUrl = (originalUrl: string, publicId: string) => {
        if (!postAny.applyWatermark || !postAny.instagramAccount?.watermarkPublicId) {
          return originalUrl;
        }

        const { watermarkPublicId, watermarkPosition, watermarkOpacity, watermarkScale } = postAny.instagramAccount;
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        
        // Scale is stored as percentage (e.g. 20), convert to decimal (0.2)
        const scale = (watermarkScale || 20) / 100;
        const opacity = watermarkOpacity || 80;
        const position = watermarkPosition || 'south_east';

        // Construct transformation string
        // l_<watermark_id>,w_<scale>,fl_relative,g_<position>,o_<opacity>
        // Note: Cloudinary overlay syntax can be tricky. 
        // Standard: /upload/l_<id>,w_<width>,g_<gravity>,o_<opacity>/<base_id>
        // Relative width: w_<float>,fl_relative
        
        const transformation = `l_${watermarkPublicId.replace('/', ':')},w_${scale},fl_relative,g_${position},o_${opacity}`;
        
        return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
      };

      // 3. Publish to Instagram
      let mediaId;

      if (postAny.mediaType === 'VIDEO' || postAny.mediaType === 'REELS') {
        // Video/Reels Logic
        const videoUrl = post.images[0];
        
        const containerId = await instagramService.createVideoContainer(
          instagramUserId,
          videoUrl,
          post.caption || '',
          accessToken,
          postAny.thumbnailUrl || undefined
        );

        // Wait for video container to be ready (videos take longer)
        let attempts = 0;
        while (attempts < 30) { // 30 attempts * 5s = 2.5 minutes max wait
          const status = await instagramService.checkContainerStatus(containerId, accessToken);
          if (status.status_code === 'FINISHED') break;
          if (status.status_code === 'ERROR') throw new Error(`Video container failed: ${status.status}`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
          attempts++;
        }

        mediaId = await instagramService.publishMedia(
          instagramUserId,
          containerId,
          accessToken
        );

      } else if (post.images && post.images.length > 1) {
        // Carousel Logic
        const containerIds = [];
        for (let i = 0; i < post.images.length; i++) {
          const imageUrl = getImageUrl(post.images[i], post.imagePublicIds[i]);
          const id = await instagramService.createMediaContainer(
            instagramUserId,
            imageUrl,
            '', // Caption not needed for children
            accessToken,
            true // isCarouselItem
          );
          containerIds.push(id);
        }

        const carouselContainerId = await instagramService.createCarouselContainer(
          instagramUserId,
          containerIds,
          post.caption || '',
          accessToken
        );
        
        // Wait for carousel container to be ready
        let attempts = 0;
        while (attempts < 10) {
          const status = await instagramService.checkContainerStatus(carouselContainerId, accessToken);
          if (status.status_code === 'FINISHED') break;
          if (status.status_code === 'ERROR') throw new Error(`Carousel container failed: ${status.status}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
          attempts++;
        }

        mediaId = await instagramService.publishMedia(
          instagramUserId,
          carouselContainerId,
          accessToken
        );
      } else {
        // Single Image Logic
        const originalUrl = (post.images && post.images.length > 0) ? post.images[0] : (post as any).imageUrl;
        const publicId = (post.imagePublicIds && post.imagePublicIds.length > 0) ? post.imagePublicIds[0] : null;
        
        if (!originalUrl) throw new Error('No image found for post');

        const imageUrl = publicId ? getImageUrl(originalUrl, publicId) : originalUrl;

        const containerId = await instagramService.createMediaContainer(
          instagramUserId,
          imageUrl,
          post.caption || '',
          accessToken,
          false
        );

        // Wait for media container to be ready
        let attempts = 0;
        while (attempts < 10) {
          const status = await instagramService.checkContainerStatus(containerId, accessToken);
          if (status.status_code === 'FINISHED') break;
          if (status.status_code === 'ERROR') throw new Error(`Media container failed: ${status.status}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
          attempts++;
        }

        mediaId = await instagramService.publishMedia(
          instagramUserId,
          containerId,
          accessToken
        );
      }

      // 4. Update Post Status (Instagram)
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'PUBLISHED',
          instagramPostId: mediaId,
          publishedAt: new Date(),
        },
      });

      console.log(`Post ${postId} published to Instagram! Media ID: ${mediaId}`);

      // ✅ 5. Twitter'a Paylaşım (shareToTwitter aktifse)
      if (postAny.shareToTwitter) {
        console.log(`Sharing post ${postId} to Twitter...`);
        
        try {
          const twitterBotUrl = process.env.TWITTER_BOT_URL || 'http://localhost:3000';
          const twitterApiKey = process.env.TWITTER_BOT_API_KEY;
          
          if (!twitterApiKey) {
            throw new Error('TWITTER_BOT_API_KEY not configured in .env');
          }
          
          // Caption'u Twitter için kısalt (280 karakter limiti)
          let twitterCaption = post.caption || '';
          const hashtagString = post.hashtags?.join(' ') || '';
          const hashtagLength = hashtagString ? hashtagString.length + 2 : 0; // +2 for \n\n
          const maxCaptionLength = 280 - hashtagLength - 10; // 10 char buffer
          
          if (twitterCaption.length > maxCaptionLength) {
            twitterCaption = twitterCaption.substring(0, maxCaptionLength - 3) + '...';
          }
          
          // Medya URL ve publicId hazırla
          const mediaUrl = post.images?.[0] || null;
          const mediaPublicId = post.imagePublicIds?.[0] || null;
          
          // Twitter Bot API'ye istek gönder
          const response = await fetch(`${twitterBotUrl}/api/external/post`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${twitterApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mediaUrl,
              mediaPublicId,
              caption: twitterCaption,
              hashtags: post.hashtags || [],
              mediaType: postAny.mediaType
            })
          });
          
          const twitterResult = await response.json();
          
          if (twitterResult.success) {
            console.log(`✅ Post ${postId} shared to Twitter! URL: ${twitterResult.result?.url}`);
            
            await prisma.post.update({
              where: { id: postId },
              data: {
                twitterStatus: 'POSTED',
                twitterPostId: twitterResult.result?.url?.split('/').pop() || null,
                twitterUrl: twitterResult.result?.url || null
              }
            });
          } else {
            throw new Error(twitterResult.error || 'Twitter posting failed');
          }
          
        } catch (twitterError: any) {
          console.error(`❌ Twitter posting failed for post ${postId}:`, twitterError.message);
          
          // Twitter hatası durumunda sadece twitterStatus güncelle, Instagram başarılı kalsın
          await prisma.post.update({
            where: { id: postId },
            data: {
              twitterStatus: 'FAILED',
              twitterError: twitterError.message
            }
          });
        }
      }
    } catch (error: any) {
      console.error(`Failed to publish post ${postId}:`, error);
      
      let errorMessage = error.message;
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = JSON.stringify(error.response.data.error);
      }

      // Verify if post actually went live despite error
      if (post && post.instagramAccount) {
        try {
          // Wait 10 seconds for Instagram to index
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          const recentMedia = await instagramService.getRecentMedia(
            post.instagramAccount.instagramUserId, 
            decrypt(post.instagramAccount.accessToken),
            5
          );

          const match = recentMedia.find((m: any) => 
            m.caption === (post.caption || '') && 
            (Date.now() - new Date(m.timestamp).getTime() < 10 * 60 * 1000) // Within 10 mins
          );

        if (match) {
          console.log(`Verifying: Post found on Instagram with ID ${match.id} despite error.`);
          await prisma.post.update({
            where: { id: postId },
            data: {
              status: 'PUBLISHED',
              instagramPostId: match.id,
              publishedAt: new Date(match.timestamp),
              error: `Recovered from error: ${errorMessage}`
            },
          });
          return; // Skip marking as failed
        }
      } catch (verifyError) {
        console.error('Verification failed:', verifyError);
      }
      }

      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'FAILED',
          error: errorMessage,
        },
      });
      
      throw error; // Trigger BullMQ retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

postWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

postWorker.on('failed', (job, err) => {
  if (job) {
    console.error(`Job ${job.id} failed: ${err.message}`);
  } else {
    console.error(`Job failed (no job data): ${err.message}`);
  }
});
