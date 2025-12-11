import { Request, Response } from 'express';
import * as scraperService from '../services/scraper.service';

export const scrape = async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const data = await scraperService.scrapeUrl(url);
    res.json({ message: 'Scraping successful', data });
  } catch (error: any) {
    res.status(500).json({ message: 'Scraping failed', error: error.message });
  }
};
