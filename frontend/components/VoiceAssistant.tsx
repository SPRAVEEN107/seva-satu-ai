"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";

// ISL/BSL Sign Language video URLs (embed for demo)
const SIGN_VIDEOS: Record<string, string> = {
  greeting: "https://www.handspeak.com/word/search/include/1/hello.mp4",
};

export default function VoiceAssistant() {
  const { language, translate } = useLanguage();
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showSignPanel, setShowSignPanel] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [response, setResponse] = useState("");
  const [mode, setMode] = useState<"wake" | "command">("wake");
  const recognitionRef = useRef<any>(null);
  const wakeRef = useRef<any>(null);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  const speak = useCallback((text: string) => {
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCodes: Record<string, string> = {
      en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN",
      kn: "kn-IN", mr: "mr-IN", bn: "bn-IN", gu: "gu-IN",
      ml: "ml-IN", pa: "pa-IN", ur: "ur-IN", or: "or-IN",
    };
    utterance.lang = langCodes[language] || "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    synth.speak(utterance);
  }, [language, synth]);

  const processCommand = useCallback((text: string) => {
    const lower = text.toLowerCase();
    let nav = "";
    let reply = "";

    // Navigation intents in multiple languages
    if (lower.includes("dashboard") || lower.includes("home") || lower.includes("डैशबोर्ड") || lower.includes("होम")) {
      nav = "/dashboard"; reply = "Opening Dashboard";
    } else if (lower.includes("grievance") || lower.includes("complaint") || lower.includes("शिकायत") || lower.includes("புகார்") || lower.includes("민원")) {
      nav = "/grievance"; reply = "Opening Grievance Portal";
    } else if (lower.includes("scheme") || lower.includes("yojana") || lower.includes("योजना") || lower.includes("திட்டம்") || lower.includes("स्कीम")) {
      nav = "/schemes"; reply = "Opening Government Schemes";
    } else if (lower.includes("eligibility") || lower.includes("पात्रता") || lower.includes("தகுதி")) {
      nav = "/eligibility"; reply = "Checking your eligibility";
    } else if (lower.includes("chat") || lower.includes("help") || lower.includes("मदद")) {
      nav = "/chat"; reply = "Opening AI Chat Assistant";
    } else if (lower.includes("track") || lower.includes("status") || lower.includes("ट्रैक")) {
      nav = "/grievance"; reply = "Opening complaint tracking";
    } else if (lower.includes("women") || lower.includes("महिला")) {
      nav = "/schemes?category=Women"; reply = "Showing Women schemes";
    } else if (lower.includes("bpl") || lower.includes("ration") || lower.includes("राशन")) {
      nav = "/schemes?category=BPL"; reply = "Showing BPL schemes";
    } else {
      reply = "I heard: " + text + ". Say Dashboard, Schemes, Grievance, or Eligibility to navigate.";
    }

    setResponse(reply);
    speak(reply);
    if (nav) {
      setTimeout(() => { router.push(nav); setIsActive(false); setMode("wake"); }, 1200);
    }
  }, [router, speak]);

  // Always-on wake word listener
  const startWakeWordListener = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const wake = new SR();
    wake.lang = "en-IN";
    wake.continuous = true;
    wake.interimResults = true;

    wake.onresult = (event: any) => {
      let result = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        result += event.results[i][0].transcript.toLowerCase();
      }
      if (result.includes("hey sevasetu") || result.includes("seva setu") || result.includes("sevasetu") || result.includes("हे सेवासेतु")) {
        wake.stop();
        setWakeWordDetected(true);
        setIsActive(true);
        setMode("command");
        setTranscript("");
        setResponse("");
        speak("Hello! I am SevaSetu, your government services assistant. How can I help you?");
        setTimeout(() => startCommandListener(), 1800);
      }
    };
    wake.onerror = () => {
      setTimeout(() => { try { wake.start(); } catch { } }, 2000);
    };
    wake.onend = () => {
      if (mode === "wake") {
        setTimeout(() => { try { wake.start(); } catch { } }, 1000);
      }
    };
    wakeRef.current = wake;
    try { wake.start(); } catch { }
  }, [speak]);

  const startCommandListener = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    const langCodes: Record<string, string> = {
      en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN",
      kn: "kn-IN", mr: "mr-IN", bn: "bn-IN", gu: "gu-IN", ml: "ml-IN", pa: "pa-IN",
    };
    rec.lang = langCodes[language] || "en-IN";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (event: any) => {
      let t = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        t += event.results[i][0].transcript;
      }
      setTranscript(t);
    };
    rec.onend = () => {
      setIsListening(false);
      if (transcript) processCommand(transcript);
    };
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    try { rec.start(); } catch { }
  }, [language, transcript, processCommand]);

  useEffect(() => {
    // Start wake word detection on mount
    const timer = setTimeout(() => startWakeWordListener(), 1000);
    return () => {
      clearTimeout(timer);
      if (wakeRef.current) { try { wakeRef.current.stop(); } catch { } }
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch { } }
    };
  }, []);

  const handleManualActivate = () => {
    setIsActive(true);
    setMode("command");
    setTranscript("");
    setResponse("");
    setWakeWordDetected(false);
    speak("Hello! I am SevaSetu. How can I help you today?");
    setTimeout(() => startCommandListener(), 1500);
  };

  const handleClose = () => {
    setIsActive(false);
    setMode("wake");
    setTranscript("");
    setWakeWordDetected(false);
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { }
    setTimeout(() => startWakeWordListener(), 500);
  };

  return (
    <>
      {/* Floating SevaSetu Button */}
      <button
        onClick={handleManualActivate}
        aria-label="Activate SevaSetu AI Voice Assistant"
        className={`fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.5)] transition-all hover:scale-110 active:scale-95 group ${isListening ? "bg-red-500 animate-pulse" : "bg-gradient-to-br from-saffron to-orange-600"}`}
      >
        <span className="text-2xl">{isListening ? "🛑" : "🎙️"}</span>
        <span className="text-[8px] font-bold text-white/80 tracking-tighter">SETU</span>
        {!isListening && (
          <span className="absolute -top-12 right-0 bg-black/80 backdrop-blur-md border border-saffron/30 text-white text-[9px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Hey SevaSetu 🎙️
          </span>
        )}
      </button>

      {/* Sign Language Toggle */}
      <button
        onClick={() => setShowSignPanel(!showSignPanel)}
        aria-label="Toggle Sign Language Panel"
        className="fixed bottom-8 right-24 z-[100] w-12 h-12 rounded-full bg-blue-600/90 flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-blue-400/30"
        title="Sign Language Support"
      >
        <span className="text-lg">🤟</span>
      </button>

      {/* Sign Language Panel */}
      {showSignPanel && (
        <div className="fixed bottom-24 right-8 z-[100] w-72 bg-[#0d1117] border border-blue-500/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              🤟 Indian Sign Language
            </h3>
            <button onClick={() => setShowSignPanel(false)} className="text-white/40 hover:text-white text-xs">✕</button>
          </div>
          <div className="bg-black/40 rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-3">
            {/* ISL Avatar/Video Demo */}
            <div className="text-center p-4">
              <div className="text-5xl mb-2 animate-bounce">🤟</div>
              <p className="text-white/60 text-xs">ISL Translation Active</p>
              <p className="text-blue-400 text-xs mt-1">Indian Sign Language</p>
            </div>
          </div>
          <div className="space-y-1">
            {["namaste", "help", "scheme", "grievance"].map(word => (
              <button key={word} onClick={() => speak(word)}
                className="w-full text-left text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors capitalize">
                🤟 {word}
              </button>
            ))}
          </div>
          <p className="text-white/30 text-[10px] mt-3 text-center">Tap words to hear pronunciation</p>
        </div>
      )}

      {/* Active SevaSetu Overlay */}
      {isActive && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050510]/90 backdrop-blur-2xl">
          {/* Header */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
            <span className="text-white/60 text-xs uppercase tracking-[0.3em] font-bold">SevaSetu AI Assistant</span>
            <div className="w-2 h-2 rounded-full bg-india-green animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          {/* Main animation */}
          <div className="relative mb-10">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 ${isListening ? "bg-red-500/20 border-2 border-red-400" : "bg-saffron/20 border-2 border-saffron/60"}`}>
              <span className="text-5xl">{isListening ? "🎙️" : wakeWordDetected ? "✨" : "🤖"}</span>
            </div>
            {isListening && (
              <>
                <div className="absolute inset-0 w-32 h-32 rounded-full bg-saffron/20 animate-ping" />
                <div className="absolute -inset-4 w-40 h-40 rounded-full border border-saffron/20 animate-spin" style={{ animationDuration: "3s" }} />
                <div className="absolute -inset-8 w-48 h-48 rounded-full border border-saffron/10 animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} />
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-white font-display text-3xl md:text-4xl font-bold mb-2">
            {isListening ? "🎙️ Listening..." : "नमस्ते! I'm SevaSetu"}
          </h1>
          <p className="text-saffron text-sm mb-6 tracking-wide">
            {isListening ? `Speaking in ${language.toUpperCase()}` : "Your AI Government Assistant"}
          </p>

          {/* Transcript */}
          {transcript && (
            <div className="max-w-2xl mx-auto px-6 mb-4 text-center">
              <p className="text-white/80 text-xl md:text-2xl font-light leading-relaxed">{transcript}</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="max-w-lg mx-auto px-6 mb-6 text-center bg-white/5 border border-saffron/20 rounded-2xl py-3 px-4">
              <p className="text-saffron text-base">{response}</p>
            </div>
          )}

          {/* Quick commands */}
          {!isListening && (
            <div className="flex flex-wrap gap-2 justify-center max-w-lg px-4 mb-8">
              {["Schemes", "Grievance", "Dashboard", "Eligibility", "Women Schemes", "BPL Schemes"].map(cmd => (
                <button key={cmd} onClick={() => processCommand(cmd)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-saffron/10 hover:border-saffron/30 hover:text-white transition-all">
                  {cmd}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            <button onClick={() => { setTranscript(""); setResponse(""); startCommandListener(); }}
              disabled={isListening}
              className="px-8 py-3 rounded-full bg-saffron text-white font-bold hover:bg-orange-600 transition-all disabled:opacity-50 text-sm">
              {isListening ? "🎙️ Speaking..." : "🎙️ Speak Command"}
            </button>
            <button onClick={handleClose}
              className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm transition-all">
              Close
            </button>
          </div>

          {/* Wake word hint */}
          <div className="absolute bottom-6 text-white/20 text-xs text-center uppercase tracking-[0.2em]">
            Say &quot;Hey SevaSetu&quot; anytime • {language.toUpperCase()} Mode
          </div>
        </div>
      )}
    </>
  );
}
