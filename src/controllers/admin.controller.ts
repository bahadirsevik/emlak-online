import { Request, Response } from 'express';
import prisma from '../config/database';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { posts: true, instagramAccounts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'USER'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true }
    });
    res.json({ message: 'User role updated', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalPosts, totalAccounts] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.instagramAccount.count()
    ]);

    res.json({
      totalUsers,
      totalPosts,
      totalAccounts
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching system stats', error: error.message });
  }
};
