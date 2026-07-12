import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { useLanguage } from './LanguageContext';
import { chatAboutProduct, ChatMessage } from '../services/geminiService';
import { Send, Bot, Sparkles, X, RefreshCw, HelpCircle } from 'lucide-react';

interface ProductAIChatProps {
  product: Product;
  onClose: () => void;
}

const ProductAIChat: React.FC<ProductAIChatProps> = ({ product, onClose }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on product type
  const suggestions = [
    language === 'bn' 
      ? 'এটি কী কী জিনিস চালাতে পারবে?' 
      : 'What appliances can this power?',
    language === 'bn' 
      ? 'প্রোডাক্টটির ওয়ারেন্টি কতদিন?' 
      : 'What is the warranty on this?',
    language === 'bn' 
      ? 'কেন এটি কেনা উচিত?' 
      : 'Why should I buy this product?',
    language === 'bn' 
      ? 'মূল বৈশিষ্ট্যগুলো কী কী?' 
      : 'What are the main features?'
  ];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeText = language === 'bn'
      ? `স্বাগতম! আমি গ্রামীণ এনার্জি এআই সহকারী। আপনি কি **${product.nameBn || product.name}** সম্পর্কে কিছু জানতে চান? যেমন- লোড হিসাব, সোলার সেটআপ বা স্পেসিফিকেশন?`
      : `Hello! I'm the Grameen Energy AI Assistant. Do you have any questions about the **${product.name}**? Feel free to ask about specifications, suitability, or installation requirements!`;
    
    setMessages([
      { role: 'assistant', text: welcomeText }
    ]);
  }, [product, language]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      const reply = await chatAboutProduct(product, updatedMessages, language);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error(err);
      const errMsg = language === 'bn' 
        ? "দুঃখিত, কোনো ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।" 
        : "Sorry, an error occurred. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const clearChat = () => {
    const welcomeText = language === 'bn'
      ? `স্বাগতম! আমি গ্রামীণ এনার্জি এআই সহকারী। আপনি কি **${product.nameBn || product.name}** সম্পর্কে কিছু জানতে চান?`
      : `Hello! I'm the Grameen Energy AI Assistant. Do you have any questions about the **${product.name}**?`;
    
    setMessages([
      { role: 'assistant', text: welcomeText }
    ]);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black bg-opacity-60 flex items-center justify-end font-sans transition-all duration-300">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 bg-blue-900 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Bot size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm md:text-base leading-none">
                  {t('Product AI Advisor', 'প্রোডাক্ট এআই এডভাইজর')}
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[10px] text-blue-200 mt-1 uppercase tracking-widest font-bold">
                {t('Powered by Gemini', 'জেমিনি এআই চালিত')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              className="p-2 hover:bg-blue-800 rounded-lg text-blue-200 hover:text-white transition"
              title={t('Restart Chat', 'নতুন চ্যাট শুরু')}
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-blue-800 rounded-lg text-blue-200 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Product Compact Card Banner */}
        <div className="p-3 bg-slate-50 border-b flex items-center gap-3">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-12 h-12 rounded-lg object-contain bg-white border p-1"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 text-xs md:text-sm truncate">
              {t(product.name, product.nameBn)}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-blue-900">৳ {product.discountPrice || product.price}</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <Bot size={16} />
                </div>
              )}
              
              <div 
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-900 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggetions & Input Form */}
        <div className="p-3 md:p-4 bg-white border-t space-y-3">
          
          {/* Suggestions */}
          {messages.length === 1 && !loading && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <HelpCircle size={12} className="text-emerald-500" />
                {t('Suggested Questions', 'প্রস্তাবিত প্রশ্নসমূহ')}:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-full transition text-left font-medium active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
            className="flex items-center gap-2"
          >
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('Ask anything about this product...', 'এই প্রোডাক্টটি সম্পর্কে যেকোনো প্রশ্ন লিখুন...')}
              className="flex-1 border border-slate-200 hover:border-slate-300 focus:border-blue-900 rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-slate-50 focus:bg-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="p-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition duration-200 shrink-0 flex items-center justify-center shadow-md active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProductAIChat;
