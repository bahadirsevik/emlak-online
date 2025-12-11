import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

const prisma = new PrismaClient();

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    const posts = await prisma.post.findMany({
      where: {
        userId,
        scheduledTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        caption: true,
        scheduledTime: true,
        status: true,
        images: true,
        instagramAccount: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    const events = posts.map(post => ({
      id: post.id,
      title: post.caption ? post.caption.substring(0, 30) + '...' : 'No Caption',
      date: post.scheduledTime,
      status: post.status,
      thumbnail: post.images[0] || null,
      account: post.instagramAccount?.username,
    }));

    res.json(events);
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
};
