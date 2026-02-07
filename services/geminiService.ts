
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEnergyAdvice = async (loadDetails: string, language: 'en' | 'bn') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an energy expert at "Grameen Energy". Based on these load details: "${loadDetails}", recommend the best setup (IPS, Solar, or Battery) and provide 3 energy saving tips. Response should be in ${language === 'bn' ? 'Bengali' : 'English'}.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'bn' ? "দুঃখিত, বর্তমানে পরামর্শ প্রদান করা সম্ভব হচ্ছে না।" : "Sorry, I cannot provide advice at the moment.";
  }
};
