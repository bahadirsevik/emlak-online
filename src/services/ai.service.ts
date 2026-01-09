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
    const prompt = `Sen bir Instagram emlak pazarlama uzmanısın. Aşağıdaki emlak ilanı için EN ETKİLİ 5 hashtag üret.

KONU: "${topic}"
DİL: ${language}

HASHTAG STRATEJİSİ (5 adet - her biri farklı kategoriden):

1. YÜKSEK HACİMLİ (1 adet) - Geniş erişim:
   - Örnek: #emlak veya #satılık

2. BÖLGE ODAKLI (1 adet) - Lokasyon hedefleme:
   - Şehir + emlak kombinasyonu
   - Örnek: #istanbulemlak #ankarasatılık

3. EMLAK TİPİ (1 adet) - Spesifik mülk:
   - Örnek: #satılıkdaire #kiralıkofis #tarlasatılık

4. TREND/FARKLI (1 adet) - Dikkat çekici:
   - Yatırım veya yaşam tarzı odaklı
   - Örnek: #yatırımfırsatı #hayalevim #emlak2024

5. AKSİYON (1 adet) - Etkileşim çağrısı:
   - Örnek: #hemenara #kaçırmayın #fırsat

KURALLAR:
- TAM 5 hashtag üret (fazla veya eksik olmasın)
- Türkçe karakterler kullan
- Sadece hashtagleri boşlukla ayırarak ver
- Açıklama yazma, sadece hashtagler
- Kısa ve akılda kalıcı olsun`;

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
