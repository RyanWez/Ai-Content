import { Tone, ContentGenerationRequest, ContentGenerationResponse, ApiError } from '../types/types';
import { API_BASE_URL, API_TIMEOUT } from '../constants/constants';

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  }

  async generateContent(
    topic: string,
    tone: Tone,
    keywords: string,
    contentLength: number
  ): Promise<string> {
    try {
      const requestBody: ContentGenerationRequest = {
        topic,
        tone,
        keywords,
        contentLength,
      };

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'An unknown error occurred',
        }));

        // Handle specific error cases
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 60;
          throw new Error(
            `Too many requests. Please wait ${retryAfter} seconds before trying again.`
          );
        }

        if (response.status === 401) {
          throw new Error('API authentication failed. Please check your configuration.');
        }

        if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid request. Please check your inputs.');
        }

        throw new Error(errorData.error || 'Failed to generate content. Please try again.');
      }

      const data: ContentGenerationResponse = await response.json();
      return data.content;
    } catch (error: any) {
      // Network errors
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(
          'Network error. Please check your internet connection and ensure the server is running.'
        );
      }

      // Re-throw with original message if it's already a formatted error
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
