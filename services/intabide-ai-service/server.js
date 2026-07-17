import express, { response } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { Redis } from '@upstash/redis';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: `AI Service is running smoothly` });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, cacheKey } = req.body;
    const cachedResponse = await redit.get(cacheKey);
    if (cachedResponse) {
      return res.json({ response: cachedResponse, cached: true });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });

    const aiText = response.text;
    await redis.set(cacheKey, aiText, { ex: 3600 });
    return res.json({ response: aiText, cached: false });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'AI Microservice internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Microservice listening on port ${PORT}`);
});
