import { GoogleGenAI } from '@google/genai';

export class GeminiClient {
  private ai: GoogleGenAI;
  private model: string = 'gemini-2.5-pro';
  private flashModel: string = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    // The new SDK initializes via GoogleGenAI
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateContent(prompt: string, useFlash: boolean = true) {
    const activeModel = useFlash ? this.flashModel : this.model;
    try {
      // The unified SDK combines models into a top-level .models property
      const response = await this.ai.models.generateContent({
        model: activeModel,
        contents: prompt,
      });

      return response.text;
    } catch (error: any) {
      console.error('Gemini API error:', error);

      // Handle rate limiting
      if (error?.status === 429 || error?.message?.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Handle unauthorized/authentication errors explicitly
      if (error?.status === 401 || error?.status === 403) {
        throw new Error(
          'Authentication failed. Ensure your AQ. key is set up correctly in your environment variables.'
        );
      }

      throw new Error(error?.message || 'Failed to generate AI response');
    }
  }

  async generateWithContext(prompt: string, context: string, useFlash: boolean = true) {
    const fullPrompt = `Context:\n${context}\n\nTask:\n${prompt}`;
    return this.generateContent(fullPrompt, useFlash);
  }

  async streamContent(prompt: string, onChunk: (chunk: string) => void) {
    const responseStream = await this.ai.models.generateContentStream({
      model: this.flashModel,
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  }
}

let geminiClient: GeminiClient | null = null;

export const getGeminiClient = () => {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }
    geminiClient = new GeminiClient(apiKey);
  }
  return geminiClient;
};
