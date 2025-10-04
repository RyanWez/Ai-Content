import { GoogleGenAI } from "@google/genai";
import { Tone } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateContent = async (topic: string, tone: Tone, keywords: string, contentLength: number): Promise<string> => {
    try {
        const keywordInstructions = keywords 
            ? `Please naturally incorporate the following keywords: ${keywords}.`
            : '';

        const prompt = `
            You are an expert content creator. Your task is to generate high-quality written content based on the following instructions.

            Topic: "${topic}"
            Tone of Voice: ${tone}
            ${keywordInstructions}
            The generated content should be approximately ${contentLength} words long.

            Please generate a well-structured, engaging, and informative piece of content. 
            Ensure the tone is consistent throughout. Do not include a title or any preamble like "Here is the content you requested". Just provide the main body of the content.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-09-2025',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate content. Please check your API key and try again.");
    }
};