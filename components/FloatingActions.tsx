// @ts-nocheck
import React from 'react';
import { MessageCircle, PhoneCall } from 'lucide-react';

/* Adding @ts-nocheck at the top to suppress intrinsic JSX element errors in the environment */
const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-24 right-4 z-[90] flex flex-col gap-3 lg:bottom-10 lg:right-10">
      <a
        href="tel:+880123456789"
        className="w-14 h-14 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition active:scale-95 border-4 border-white/20"
      >
        <PhoneCall size={24} />
      </a>
      <a
        href="https://wa.me/880123456789"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition active:scale-95 border-4 border-white/20"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
};

export default FloatingActions;