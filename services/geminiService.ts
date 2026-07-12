/**
 * Service to call Gemini AI through the backend server.
 */

export const getEnergyAdvice = async (loadDetails: string, language: 'en' | 'bn'): Promise<string> => {
  try {
    const response = await fetch("/api/gemini/advice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loadDetails, language }),
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();
    return data.text || (language === 'bn' ? "দুঃখিত, বর্তমানে পরামর্শ প্রদান করা সম্ভব হচ্ছে না।" : "Sorry, I cannot provide advice at the moment.");
  } catch (error) {
    console.error("Energy advice fetch error:", error);
    return language === 'bn' ? "দুঃখিত, বর্তমানে পরামর্শ প্রদান করা সম্ভব হচ্ছে না।" : "Sorry, I cannot provide advice at the moment.";
  }
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const chatAboutProduct = async (product: any, messages: ChatMessage[], language: 'en' | 'bn'): Promise<string> => {
  try {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product, messages, language }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Server error");
    }

    const data = await response.json();
    return data.text || (language === 'bn' ? "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।" : "Sorry, no response could be generated.");
  } catch (error: any) {
    console.error("Product Chat API error:", error);
    return language === 'bn' 
      ? `দুঃখিত, এআই সার্ভারের সাথে যোগাযোগ করা সম্ভব হয়নি: ${error.message || ''}` 
      : `Sorry, could not connect to the AI server: ${error.message || ''}`;
  }
};
