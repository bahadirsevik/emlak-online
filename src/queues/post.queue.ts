import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const postQueue = new Queue('post-queue', {
  connection: redisConnection,
});

export const addPostJob = async (postId: string, userId: string, scheduledTime?: Date) => {
  const delay = scheduledTime ? scheduledTime.getTime() - Date.now() : 0;
  
  await postQueue.add(
    'publish-post',
    { postId, userId },
    {
      delay: Math.max(0, delay),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    }
  );
  
  console.log(`Job added for post ${postId}, scheduled for: ${scheduledTime || 'now'}`);
};
