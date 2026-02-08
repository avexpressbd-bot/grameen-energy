
import { GoogleGenAI } from "@google/genai";

/**
 * Service to provide energy advice using Gemini AI.
 * Following guidelines to initialize right before making an API call and using process.env.API_KEY directly.
 */
export const getEnergyAdvice = async (loadDetails: string, language: 'en' | 'bn') => {
  try {
    // Fix: Initialize GoogleGenAI strictly using process.env.API_KEY as per the guidelines.
    // Assume API_KEY is pre-configured and accessible.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fix: Using gemini-3-flash-preview for general text task.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an energy expert at "Grameen Energy". Based on these load details: "${loadDetails}", recommend the best setup (IPS, Solar, or Battery) and provide 3 energy saving tips. Response should be in ${language === 'bn' ? 'Bengali' : 'English'}.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disabling thinking for lower latency as per guidelines
      }
    });

    // Fix: Accessing .text property directly (not a method call) as per SDK response rules.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'bn' ? "দুঃখিত, বর্তমানে পরামর্শ প্রদান করা সম্ভব হচ্ছে না।" : "Sorry, I cannot provide advice at the moment.";
  }
};
