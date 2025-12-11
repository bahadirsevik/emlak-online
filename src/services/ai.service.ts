import openai, { openaiVision } from '../config/ai';

export const analyzeImage = async (imageUrl: string) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API Key is missing for vision features');
    }

    const response = await openaiVision.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this real estate image. Describe the key features, style, lighting, and atmosphere in detail. Keep it professional and suitable for a listing description." },
            {
              type: "image_url",
              image_url: {
                "url": imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Vision Analysis Error:', error);
    throw new Error('Failed to analyze image');
  }
};

export const generateCaption = async (topic: string, tone: string, language: string) => {
  try {
    const prompt = `Write an engaging Instagram caption about "${topic}".
    Tone: ${tone}.
    Language: ${language}.
    Include relevant emojis.
    Do not include hashtags in the caption text (I will generate them separately).
    Keep it under 2200 characters.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: process.env.AI_MODEL || "deepseek-chat",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('Failed to generate caption');
  }
};

export const generateRealEstateCaption = async (details: any, language: string, tone: string = 'Professional', imageAnalysis?: string) => {
  try {
    const prompt = `Act as a professional Real Estate Consultant. Write a caption for the following property.
    
    I will provide two inputs:
    1. Property Details (Structured data)
    2. Visual Analysis (Description of the image, potentially in English)

    Your task is to SYNTHESIZE these two inputs into a single, cohesive, and professional Instagram caption in ${language}.
    
    INPUT 1: Property Details
    Type: ${details.type}
    Title: ${details.title}
    Location: ${details.location}
    Price: ${details.price}
    Rooms: ${details.rooms}
    Features: ${details.features}

    INPUT 2: Visual Analysis (Incorporate relevant aesthetic details from here)
    ${imageAnalysis || 'No visual analysis provided.'}

    GUIDELINES:
    - Language: ${language} (Strictly).
    - Tone: ${tone}.
    - Tone Guidelines:
        - Professional: Corporate, serious, trustworthy, no emojis (or very minimal).
        - Friendly: Warm, inviting, uses "we/you", moderate emojis.
        - Fun: Energetic, exciting, uses more emojis and exclamation marks.
        - Inspiring: Dreamy, storytelling, focus on lifestyle.
        - Minimal: Short, punchy, facts-only, clean.

    Structure:
    1. Headline (matching the tone)
    2. Integrated Description (Combine facts with visual atmosphere)
    3. Key Features List (Bulleted)
    4. Call to Action
    5. Do NOT include hashtags in the caption text.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: process.env.AI_MODEL || "deepseek-chat",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('Failed to generate real estate caption');
  }
};

export const generateHashtags = async (topic: string, language: string) => {
  try {
    const prompt = `Generate exactly 8 high-quality, professional, and strictly relevant Instagram hashtags for a real estate post about "${topic}".
    Language: ${language}.
    
    Guidelines:
    1. Use only the most relevant and popular tags.
    2. Avoid generic or spammy tags (like #love, #instagood).
    3. Focus on location, property type, and real estate terms.
    
    Return ONLY the hashtags separated by spaces. No other text.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: process.env.AI_MODEL || "deepseek-chat",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('Failed to generate hashtags');
  }
};
