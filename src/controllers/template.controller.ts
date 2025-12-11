import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, content } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }

    const template = await prisma.template.create({
      data: {
        name,
        content,
        userId,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Failed to create template' });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const templates = await prisma.template.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;
    const userId = (req as any).user?.id;

    const template = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name,
        content,
      },
    });

    res.json(updatedTemplate);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const template = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await prisma.template.delete({
      where: { id },
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Failed to delete template' });
  }
};
