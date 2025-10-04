import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Rate limiting map (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Rate limiting middleware
const rateLimit = (req: Request, res: Response, next: Function) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (userLimit) {
    if (now < userLimit.resetTime) {
      if (userLimit.count >= RATE_LIMIT) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
        });
      }
      userLimit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }

  next();
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Content generation endpoint
app.post('/api/generate', rateLimit, async (req: Request, res: Response) => {
  try {
    const { topic, tone, keywords, contentLength } = req.body;

    // Input validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required and must be a non-empty string' });
    }

    if (!tone || typeof tone !== 'string') {
      return res.status(400).json({ error: 'Tone is required and must be a string' });
    }

    if (contentLength && (typeof contentLength !== 'number' || contentLength < 50 || contentLength > 1000)) {
      return res.status(400).json({ error: 'Content length must be between 50 and 1000 words' });
    }

    // Sanitize inputs
    const sanitizedTopic = topic.trim().substring(0, 500);
    const sanitizedKeywords = keywords ? String(keywords).trim().substring(0, 200) : '';
    const sanitizedContentLength = contentLength || 200;

    // Build prompt
    const keywordInstructions = sanitizedKeywords
      ? `Please naturally incorporate the following keywords: ${sanitizedKeywords}.`
      : '';

    const prompt = `
      You are an expert content creator. Your task is to generate high-quality written content based on the following instructions.

      Topic: "${sanitizedTopic}"
      Tone of Voice: ${tone}
      ${keywordInstructions}
      The generated content should be approximately ${sanitizedContentLength} words long.

      Please generate a well-structured, engaging, and informative piece of content. 
      Ensure the tone is consistent throughout. Do not include a title or any preamble like "Here is the content you requested". Just provide the main body of the content.
    `;

    // Generate content
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-09-2025',
      contents: prompt,
    });

    const generatedText = response.text;

    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    res.json({
      content: generatedText,
      metadata: {
        topic: sanitizedTopic,
        tone,
        keywords: sanitizedKeywords,
        requestedLength: sanitizedContentLength,
        actualLength: generatedText.split(/\s+/).length
      }
    });

  } catch (error: any) {
    console.error('Error generating content:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key configuration' });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }

    res.status(500).json({
      error: 'Failed to generate content. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI configured and ready`);
});
