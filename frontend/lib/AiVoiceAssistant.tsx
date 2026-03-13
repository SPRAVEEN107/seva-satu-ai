"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "./LanguageContext";
import gsap from "gsap";

export default function AiVoiceAssistant() {
  const { language, translate } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const assistRef = useRef<HTMLDivElement>(null);
  
  // Web Speech API
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Set language based on context
      rec.lang = language === 'en' ? 'en-IN' : `${language}-IN`;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice Input Received:", transcript);
        handleVoiceCommand(transcript);
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(rec);
    }
  }, [language]);

  const toggleListen = () => {
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    } else if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch(e) {
        console.error(e);
      }
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop listening while speaking to avoid feedback loops
      if (recognition && isListening) {
          recognition.stop();
      }
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-IN' : `${language}-IN`;
      utterance.rate = 0.9; // Slightly slower for rural accessibility
      
      utterance.onend = () => {
          setIsSpeaking(false);
          // Resume listening if it was active
          if (recognition && isListening) {
              try { recognition.start(); } catch(e) {}
          }
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    const text = transcript.toLowerCase();
    
    // Simple command routing simulation
    if (text.includes("apply") || text.includes("scheme")) {
      window.location.href = "/schemes";
      speakText(translate("Taking you to the schemes page."));
    } else if (text.includes("complain") || text.includes("grievance")) {
      window.location.href = "/grievance";
      speakText(translate("Taking you to the grievance page. Please state your issue."));
    } else {
      speakText(translate("I heard you say") + " " + transcript + ". " + translate("How can I help you?"));
    }
  };

  return (
    <div 
      ref={assistRef}
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-transform`}
    >
      {/* Minimal indicator */}
      {isSpeaking && (
        <div className="w-2 h-2 rounded-full bg-saffron animate-ping mb-2 self-center" />
      )}
      
      <button 
        onClick={toggleListen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isListening ? "bg-red-500 scale-110 animate-pulse" : "bg-saffron hover:scale-105"
        }`}
        aria-label="Voice Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" x2="12" y1="19" y2="22"></line>
        </svg>
      </button>
    </div>
  );
}
