/// <reference types="vite/client" />

import { Tone } from '../types/types';

export const TONE_OPTIONS: Tone[] = [
  Tone.PROFESSIONAL,
  Tone.CASUAL,
  Tone.ENTHUSIASTIC,
  Tone.INFORMATIVE,
  Tone.HUMOROUS,
  Tone.PERSUASIVE,
];

// Content length constraints
export const MIN_CONTENT_LENGTH = 50;
export const MAX_CONTENT_LENGTH = 1000;
export const DEFAULT_CONTENT_LENGTH = 200;

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const API_TIMEOUT = 30000; // 30 seconds

// UI constants
export const COPY_SUCCESS_DURATION = 2000; // 2 seconds
export const MAX_TOPIC_LENGTH = 500;
export const MAX_KEYWORDS_LENGTH = 200;
