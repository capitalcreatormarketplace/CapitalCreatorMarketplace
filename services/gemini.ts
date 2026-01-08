
import { GoogleGenAI } from "@google/genai";

export async function optimizeListingDescription(
  streamTime: string,
  rawPlacement: string,
  platform: string
): Promise<string> {
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
    return response.text || rawPlacement;
  } catch (error) {
    console.error("Gemini optimization failed:", error);
    return rawPlacement;
  }
}

/**
 * Robust X Verification via Gemini Search Grounding
 * This tool searches the live web for the tweet to confirm content and authorship.
 */
export async function verifyXProtocol(
  handle: string,
  url: string,
  challengeCode: string
): Promise<{ success: boolean; message: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanHandle = handle.replace('@', '').toLowerCase();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model required for high-accuracy grounding
      contents: `You are a high-security verification engine for Capital Creator.
      TASK: Verify if the user "${cleanHandle}" has posted a tweet containing the code "${challengeCode}".
      USER PROVIDED URL: ${url}

      RULES:
      1. Use Google Search to verify the content of the tweet at the provided URL.
      2. The author of the tweet MUST BE "${cleanHandle}".
      3. The text of the tweet MUST contain "${challengeCode}".
      4. If the URL doesn't exist, contains different text, or is from a different user, return SUCCESS: FALSE.
      
      RETURN FORMAT: A JSON object with "success" (boolean) and "reason" (string).`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{"success": false, "reason": "No response from protocol."}');
    return {
      success: !!result.success,
      message: result.reason || (result.success ? "Neural verification passed." : "Identity mismatch detected.")
    };
  } catch (error) {
    console.error("X Verification Protocol Failure:", error);
    return { success: false, message: "Protocol timeout. Ensure tweet is public." };
  }
}
