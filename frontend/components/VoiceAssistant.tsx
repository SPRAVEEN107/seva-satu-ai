"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";

export default function VoiceAssistant() {
  const { language, translate } = useLanguage();
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Map supported languages to recognition codes
    const langCodes: any = {
      en: 'en-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      ml: 'ml-IN',
      pa: 'pa-IN'
    };
    
    recognition.lang = langCodes[language] || 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let currentResult = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentResult += event.results[i][0].transcript;
      }
      setTranscript(currentResult);
      
      const lower = currentResult.toLowerCase();
      
      // Global navigation intents
      if (lower.includes("dashboard") || lower.includes("home") || lower.includes("डैशबोर्ड")) {
        router.push("/dashboard");
        setIsListening(false);
      } else if (lower.includes("grievance") || lower.includes("complaint") || lower.includes("शिकायत")) {
        router.push("/grievance");
        setIsListening(false);
      } else if (lower.includes("scheme") || lower.includes("yojana") || lower.includes("योजना")) {
        router.push("/schemes");
        setIsListening(false);
      } else if (lower.includes("track") || lower.includes("ट्रैक")) {
        router.push("/grievance"); // Tracking is on grievance page
        setIsListening(false);
      }
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleVoice}
        className={`fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-all hover:scale-110 active:scale-95 ${isListening ? 'bg-red-500' : 'bg-saffron'}`}
      >
        <span className="text-xl">{isListening ? "🛑" : "🎙️"}</span>
        {!isListening && (
          <span className="absolute -top-10 right-0 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap animate-bounce">
            AI Voice
          </span>
        )}
      </button>

      {/* Speech Overlay */}
      {isListening && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative mb-12">
            <div className="w-24 h-24 rounded-full bg-saffron/20 flex items-center justify-center relative z-10">
              <span className="text-4xl animate-pulse">🎙️</span>
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-saffron/40 animate-ping opacity-50" />
            <div className="absolute -inset-4 w-32 h-32 rounded-full border border-saffron/20 animate-spin-slow" />
          </div>
          
          <p className="text-saffron font-display text-lg mb-6 tracking-widest uppercase">
            {translate("Listening...")} ({language.toUpperCase()})
          </p>
          
          <div className="max-w-3xl text-center px-6">
            <h2 className="text-white text-3xl md:text-5xl font-display font-medium leading-tight">
              {transcript || "..."}
            </h2>
          </div>
          
          <div className="mt-16 flex gap-4">
            <button 
              onClick={() => setIsListening(false)}
              className="px-8 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              {translate("Done")}
            </button>
          </div>
          
          <div className="mt-12 text-muted/40 text-xs text-center uppercase tracking-[0.2em]">
            {translate("Say 'Dashboard', 'Grievance', or 'Schemes' to navigate")}
          </div>
        </div>
      )}
    </>
  );
}
