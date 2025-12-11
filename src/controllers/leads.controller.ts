import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch leads for all accounts belonging to the user
    const leads = await prisma.lead.findMany({
      where: {
        instagramAccount: {
          userId: userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        instagramAccount: {
          select: {
            username: true
          }
        }
      }
    });

    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};
