import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openaiVision = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default openai;
