import { GoogleGenAI } from "@google/genai";

/**
 * Service to provide energy advice using Gemini AI.
 * Following guidelines to initialize right before making an API call and using process.env.API_KEY directly.
 */
export const getEnergyAdvice = async (loadDetails: string, language: 'en' | 'bn') => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return language === 'bn' ? "দুঃখিত, বর্তমানে এআই পরামর্শ সেবা বন্ধ আছে।" : "Sorry, AI advice service is currently unavailable.";
  }

  try {
    // Initialize GoogleGenAI right before use to ensure the most up-to-date key is used.
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an energy expert at "Grameen Energy". Based on these load details: "${loadDetails}", recommend the best setup (IPS, Solar, or Battery) and provide 3 energy saving tips. Response should be in ${language === 'bn' ? 'Bengali' : 'English'}.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disabling thinking for lower latency as per guidelines
      }
    });
    // Accessing .text property directly (not a method call) as per SDK extracted response rules.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'bn' ? "দুঃখিত, বর্তমানে পরামর্শ প্রদান করা সম্ভব হচ্ছে না।" : "Sorry, I cannot provide advice at the moment.";
  }
};