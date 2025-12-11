import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLatestPost() {
  try {
    const post = await prisma.post.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    console.log('--------------------------------');
    console.log('Server Time (UTC):', new Date().toISOString());
    console.log('Server Time (Local):', new Date().toLocaleString());
    if (post) {
        console.log('Post ID:', post.id);
        console.log('Status:', post.status);
        console.log('Scheduled Time (UTC):', post.scheduledTime ? post.scheduledTime.toISOString() : 'None');
        console.log('Scheduled Time (Local):', post.scheduledTime ? post.scheduledTime.toLocaleString() : 'None');
        console.log('Created At:', post.createdAt.toLocaleString());
    } else {
        console.log('No posts found.');
    }
    console.log('--------------------------------');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestPost();
