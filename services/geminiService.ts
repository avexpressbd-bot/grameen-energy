import { GoogleGenAI } from "@google/genai";

// API Key না থাকলে অ্যাপ ক্রাশ রোধে ডিফল্ট ভ্যালু
const apiKey = process.env.API_KEY || "AI_KEY_NOT_FOUND";
const ai = new GoogleGenAI({ apiKey });

export const getEnergyAdvice = async (loadDetails: string, language: 'en' | 'bn') => {
  if (apiKey === "AI_KEY_NOT_FOUND") {
    return language === 'bn' ? "দুঃখিত, বর্তমানে এআই পরামর্শ সেবা বন্ধ আছে।" : "Sorry, AI advice service is currently unavailable.";
  }

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