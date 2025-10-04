export enum Tone {
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  ENTHUSIASTIC = 'Enthusiastic',
  INFORMATIVE = 'Informative',
  HUMOROUS = 'Humorous/Funny',
  PERSUASIVE = 'Persuasive',
}

export interface ContentGenerationRequest {
  topic: string;
  tone: Tone;
  keywords?: string;
  contentLength: number;
}

export interface ContentGenerationResponse {
  content: string;
  metadata: {
    topic: string;
    tone: string;
    keywords: string;
    requestedLength: number;
    actualLength: number;
  };
}

export interface ApiError {
  error: string;
  details?: string;
  retryAfter?: number;
}

export interface HistoryItem {
  id: string;
  topic: string;
  tone: Tone;
  keywords: string;
  contentLength: number;
  generatedContent: string;
  timestamp: number;
}
