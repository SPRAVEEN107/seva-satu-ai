"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { useRouter } from "next/navigation";

export default function AiVoiceAssistant() {
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
    
    const langCodes: any = {
      en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', 
      mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', ml: 'ml-IN', pa: 'pa-IN'
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
      if (lower.includes("dashboard") || lower.includes("डैशबोर्ड")) {
        router.push("/dashboard");
        setIsListening(false);
      } else if (lower.includes("grievance") || lower.includes("complaint") || lower.includes("शिकायत")) {
        router.push("/grievance");
        setIsListening(false);
      } else if (lower.includes("scheme") || lower.includes("योजना")) {
        router.push("/schemes");
        setIsListening(false);
      }
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <>
      <button
        onClick={toggleVoice}
        className={`fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${isListening ? 'bg-red-500' : 'bg-saffron'}`}
      >
        <span className="text-xl">{isListening ? "🛑" : "🎙️"}</span>
      </button>

      {isListening && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full bg-saffron/20 flex items-center justify-center relative z-10">
              <span className="text-3xl animate-pulse">🎙️</span>
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-saffron/40 animate-ping opacity-50" />
          </div>
          <p className="text-saffron font-display text-sm mb-4 tracking-widest uppercase">
            {translate("Listening...")} ({language.toUpperCase()})
          </p>
          <div className="max-w-xl text-center px-6">
            <h2 className="text-white text-2xl md:text-4xl font-display font-medium leading-tight">
              {transcript || "..."}
            </h2>
          </div>
          <button 
            onClick={() => setIsListening(false)}
            className="mt-12 px-8 py-2 rounded-full border border-white/20 text-white/60 hover:text-white transition-all"
          >
            {translate("Done")}
          </button>
        </div>
      )}
    </>
  );
}
