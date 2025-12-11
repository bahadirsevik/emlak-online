import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, subDays, format } from 'date-fns';

const prisma = new PrismaClient();

export const getOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Total stats
    const totalPosts = await prisma.post.count({ where: { userId } });
    const publishedPosts = await prisma.post.count({ where: { userId, status: 'PUBLISHED' } });
    const failedPosts = await prisma.post.count({ where: { userId, status: 'FAILED' } });
    const scheduledPosts = await prisma.post.count({ where: { userId, status: 'SCHEDULED' } });

    // Daily volume for last 30 days
    const postsLast30Days = await prisma.post.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    // Group by date
    const dailyVolume = new Map<string, number>();
    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyVolume.set(date, 0);
    }

    postsLast30Days.forEach(post => {
      const date = format(post.createdAt, 'yyyy-MM-dd');
      dailyVolume.set(date, (dailyVolume.get(date) || 0) + 1);
    });

    const chartData = Array.from(dailyVolume.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      stats: {
        total: totalPosts,
        published: publishedPosts,
        failed: failedPosts,
        scheduled: scheduledPosts,
        successRate: totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0
      },
      chartData
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics overview' });
  }
};

export const getAccountStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const accounts = await prisma.instagramAccount.findMany({
      where: { userId },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    const accountStats = await Promise.all(accounts.map(async (account) => {
      const publishedCount = await prisma.post.count({
        where: {
          instagramAccountId: account.id,
          status: 'PUBLISHED'
        }
      });

      return {
        username: account.username,
        totalPosts: account._count.posts,
        publishedPosts: publishedCount,
        successRate: account._count.posts > 0 ? Math.round((publishedCount / account._count.posts) * 100) : 0
      };
    }));

    res.json(accountStats);
  } catch (error) {
    console.error('Account stats error:', error);
    res.status(500).json({ message: 'Failed to fetch account stats' });
  }
};
