
import { GoogleGenAI } from "@google/genai";

export async function optimizeListingDescription(
  streamTime: string,
  rawPlacement: string,
  platform: string
): Promise<string> {
  // Fix: Initialize GoogleGenAI inside the function to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a premium ad copywriter. Refine the following content ad inventory listing to make it more attractive to corporate sponsors. 
      Platform: ${platform}
      Timing: ${streamTime}
      Placement Detail: ${rawPlacement}
      
      Keep it professional, high-impact, and brief (max 3 sentences).`,
    });
    // Fix: Access .text property directly (not a method) as per SDK specifications
    return response.text || rawPlacement;
  } catch (error) {
    console.error("Gemini optimization failed:", error);
    return rawPlacement;
  }
}
