import { GoogleGenAI } from "@google/genai";

export const getGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    throw new Error("Missing GEMINI_API_KEY");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
};
