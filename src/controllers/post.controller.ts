import { Request, Response } from 'express';
import prisma from '../config/database';
import { addPostJob } from '../queues/post.queue';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const schedulePost = async (req: AuthRequest, res: Response) => {
  const { images, imagePublicIds, caption, scheduledTime, instagramAccountId, applyWatermark } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!images || !images.length || !imagePublicIds || !instagramAccountId) {
    return res.status(400).json({ message: 'Images, Image IDs and Instagram Account are required' });
  }

  try {
    // 1. Create Post in DB
    const post = await prisma.post.create({
      data: {
        userId,
        instagramAccountId,
        images,
        imagePublicIds,
        caption,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(),
        status: 'SCHEDULED',
        applyWatermark: applyWatermark || false,
        mediaType: req.body.mediaType || 'IMAGE',
        thumbnailUrl: req.body.thumbnailUrl,
      } as any,
    });

    // 2. Add to Queue
    await addPostJob(post.id, userId, post.scheduledTime || undefined);

    res.status(201).json({ message: 'Post scheduled successfully', post });
  } catch (error: any) {
    console.error('Schedule Error:', error);
    res.status(500).json({ message: 'Failed to schedule post', error: error.message });
  }
};

export const getPostStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'User not authenticated' });

  try {
    const [total, scheduled, published, failed] = await Promise.all([
      prisma.post.count({ where: { userId } }),
      prisma.post.count({ where: { userId, status: 'SCHEDULED' } }),
      prisma.post.count({ where: { userId, status: 'PUBLISHED' } }),
      prisma.post.count({ where: { userId, status: 'FAILED' } }),
    ]);

    res.json({ total, scheduled, published, failed });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

export const getRecentPosts = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'User not authenticated' });

  try {
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        instagramAccount: {
          select: { username: true }
        }
      }
    });

    res.json({ posts });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching recent posts', error: error.message });
  }
};
