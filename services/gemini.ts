import { GoogleGenAI } from "@google/genai";

// Standard ESM safety for process.env in browser
const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function optimizeListingDescription(
  streamTime: string,
  rawPlacement: string,
  platform: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a premium ad copywriter. Refine the following livestream ad inventory listing to make it more attractive to corporate sponsors. 
      Platform: ${platform}
      Stream Time: ${streamTime}
      Placement Detail: ${rawPlacement}
      
      Keep it professional, high-impact, and brief (max 3 sentences).`,
    });
    return response.text || rawPlacement;
  } catch (error) {
    console.error("Gemini optimization failed:", error);
    return rawPlacement;
  }
}