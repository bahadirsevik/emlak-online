import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHashtagGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const groups = await prisma.hashtagGroup.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(groups);
  } catch (error) {
    console.error('Get hashtag groups error:', error);
    res.status(500).json({ message: 'Failed to fetch hashtag groups' });
  }
};

export const createHashtagGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, hashtags } = req.body;

    if (!name || !hashtags || !Array.isArray(hashtags)) {
      res.status(400).json({ message: 'Name and hashtags array are required' });
      return;
    }

    const group = await prisma.hashtagGroup.create({
      data: {
        name,
        hashtags,
        userId,
      },
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Create hashtag group error:', error);
    res.status(500).json({ message: 'Failed to create hashtag group' });
  }
};

export const deleteHashtagGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await prisma.hashtagGroup.deleteMany({
      where: {
        id,
        userId,
      },
    });

    res.json({ message: 'Hashtag group deleted' });
  } catch (error) {
    console.error('Delete hashtag group error:', error);
    res.status(500).json({ message: 'Failed to delete hashtag group' });
  }
};
