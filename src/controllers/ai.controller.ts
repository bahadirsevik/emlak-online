import { Request, Response } from 'express';
import * as aiService from '../services/ai.service';

export const generateCaption = async (req: Request, res: Response) => {
  try {
    const { topic, tone, language, type, details, imageAnalysis } = req.body;

    let caption;
    if (type === 'real-estate') {
      caption = await aiService.generateRealEstateCaption(details, language || 'Turkish', tone, imageAnalysis);
    } else {
      caption = await aiService.generateCaption(topic, tone || 'professional', language || 'Turkish');
    }

    res.json({ caption });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const generateHashtags = async (req: Request, res: Response) => {
  const { topic, language } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  try {
    const hashtags = await aiService.generateHashtags(topic, language || 'Turkish');
    res.status(200).json({ hashtags });
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating hashtags', error: error.message });
  }
};

export const analyzeImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const analysis = await aiService.analyzeImage(imageUrl);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
