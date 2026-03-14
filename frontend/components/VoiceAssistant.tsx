"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VoiceAssistant() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "awake" | "listening" | "responding" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const recRef = useRef<any>(null);
  const wakeRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── Audio Feedback (Beep) ──────────────────────────────────────
  const playBeep = (freq = 660, type: OscillatorType = "sine", duration = 0.1) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio feedback failed", e);
    }
  };

  // ── Speak helper ──────────────────────────────────────────────
  const speak = (text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    u.rate = 1.0;
    u.pitch = 1.1;

    let callbackCalled = false;
    const safeDone = () => {
      if (callbackCalled) return;
      callbackCalled = true;
      if (onDone) onDone();
    };

    u.onend = safeDone;
    u.onerror = safeDone;
    
    // Safety fallback: if speech doesn't end (common on some browsers/Windows)
    // estimated duration: word count * 0.5s + 2s padding
    const timeout = (text.split(" ").length * 500) + 2000;
    setTimeout(safeDone, timeout);

    window.speechSynthesis.speak(u);
  };

  // ── Command Handling ───────────────────────────────────────────
  const handleCommand = (text: string) => {
    const t = text.toLowerCase().trim();
    let reply = "";
    let path = "";

    // Exact or Fuzzy matching for fast navigation
    if (t.match(/scheme|yojana|योजना|திட்டம்|apply|लागू|वैकल्पिक|benefits|i want schemes|take me to schemes/)) {
      path = "/schemes"; reply = "Opening Schemes.";
    } else if (t.match(/grievance|complaint|शिकायत|புகார்|register|file|problem|i want to complain/)) {
      path = "/grievance"; reply = "Opening Grievance.";
    } else if (t.match(/dashboard|home|डैशबोर्ड|status|go home/)) {
      path = "/dashboard"; reply = "Opening Dashboard.";
    } else if (t.match(/eligib|पात्रता|தகுதி|check|qualified|am i eligible/)) {
      path = "/eligibility"; reply = "Checking eligibility.";
    } else if (t.match(/chat|help|मदद|support|ai|talk|i want to chat/)) {
      path = "/chat"; reply = "Opening AI Chat.";
    } else if (t.match(/track|id|status/)) {
      path = "/grievance"; reply = "Tracking complaint.";
    } else if (t.match(/women|महिला|female/)) {
      path = "/schemes"; reply = "Showing Women schemes.";
    } else if (t.match(/poor|bpl|गरीब/)) {
      path = "/schemes"; reply = "Showing BPL schemes.";
    } else {
      reply = "I heard " + t + ". Please say Schemes or Grievance.";
    }

    setResponse(reply);
    speak(reply, () => {
      if (path) {
        setPhase("idle");
        router.push(path);
      } else {
        setPhase("awake");
        setTimeout(() => startCommandListen(), 300);
      }
    });
  };

  // ── Command Listener ───────────────────────────────────────────
  const startCommandListen = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setErrorMessage("Speech API not supported.");
      setPhase("error");
      return;
    }

    // Stop wake word temporarily
    if (wakeRef.current) { try { wakeRef.current.abort(); } catch {} }
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;

    transcriptRef.current = "";

    rec.onstart = () => {
      setPhase("listening");
    };

    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      transcriptRef.current = t;
      setTranscript(t);
    };

    rec.onend = () => {
      const final = transcriptRef.current;
      if (final.trim()) {
        setPhase("responding");
        handleCommand(final);
      } else if (phase === "listening") {
        playBeep(440, "sine", 0.1);
        setPhase("idle");
        startWakeWord();
      }
    };

    rec.onerror = (e: any) => {
      if (e.error !== "aborted" && phase === "listening") {
        setPhase("idle");
        startWakeWord();
      }
    };

    recRef.current = rec;
    try { 
      rec.start(); 
    } catch (e) { 
      setPhase("idle");
      startWakeWord(); 
    }
  };

  // ── Wake Word Listener ─────────────────────────────────────────
  const startWakeWord = () => {
    if (phase !== "idle") return;
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    
    // Clean up old instance
    if (wakeRef.current) { try { wakeRef.current.abort(); } catch {} }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const wake = new SR();
    wake.lang = "en-IN";
    wake.continuous = true;
    wake.interimResults = true;

    wake.onresult = (e: any) => {
      let heard = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        heard += e.results[i][0].transcript.toLowerCase();
      }
      
      const triggers = [
        "hey sevasetu", "sevasetu", "seva setu", "hey seva", "सेवासेतु", "नमस्ते", 
        "hello sevasetu", "ok sevasetu", "hi sevasetu", "wake up", "setu",
        "hey setu", "hey satu", "hey sattu", "hi setu", "hi satu"
      ];
      if (triggers.some(t => heard.includes(t))) {
        try { wake.abort(); } catch {} 
        setPhase("awake");
        setTranscript("");
        transcriptRef.current = "";
        setResponse("");
        playBeep(660, "sine", 0.1); // Wake up beep
        
        // Zero-latency: start listening IMMEDIATELY
        startCommandListen();
        
        // Parallel greeting (don't block listening)
        speak("Yes? I am listening.");
      }
    };

    wake.onend = () => {
      if (phase === "idle") {
        setTimeout(() => startWakeWord(), 400);
      }
    };

    wake.onerror = (e: any) => {
      if (e.error === "not-allowed") {
        setErrorMessage("Microphone access denied.");
        setPhase("error");
      } else if (e.error !== "aborted") {
        setTimeout(() => startWakeWord(), 1000);
      }
    };

    wakeRef.current = wake;
    try { wake.start(); } catch (e) {
      console.error("Wake start failed", e);
      setTimeout(() => startWakeWord(), 2000);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => startWakeWord(), 1000);
    return () => {
      clearTimeout(t);
      if (wakeRef.current) try { wakeRef.current.abort(); } catch {}
      if (recRef.current) try { recRef.current.abort(); } catch {}
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const manualActivate = () => {
    if (wakeRef.current) try { wakeRef.current.abort(); } catch {}
    setPhase("awake");
    setTranscript("");
    transcriptRef.current = "";
    setResponse("");
    playBeep(660, "sine", 0.1);
    speak("Yes, I am listening. Please tell me your command.", () => {
      startCommandListen();
    });
  };

  const closeAssistant = () => {
    setPhase("idle");
    setTranscript("");
    setResponse("");
    if (recRef.current) try { recRef.current.abort(); } catch {}
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setTimeout(() => startWakeWord(), 500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={manualActivate}
        className={`fixed bottom-8 right-8 z-[9999] w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95
        ${phase === "listening" ? "bg-red-500 animate-pulse scale-110" : 
          phase === "awake" || phase === "responding" ? "bg-green-500" : 
          phase === "error" ? "bg-gray-700" : "bg-gradient-to-br from-saffron to-[#ff8c00]"}
        `}
      >
        <span className="text-2xl">
          {phase === "listening" ? "🔊" : phase === "error" ? "⚠️" : "🎙️"}
        </span>
        <span className="text-[7px] font-black text-white tracking-widest uppercase">Setu</span>
      </button>

      {/* Wake Hint */}
      {phase === "idle" && (
        <div className="fixed bottom-28 right-8 z-[9998] bg-black/80 backdrop-blur border border-white/10 rounded-full px-4 py-2 text-[10px] text-white/80 font-bold pointer-events-none shadow-xl animate-bounce">
          Say <span className="text-saffron">&quot;Hey SevaSetu&quot;</span>
        </div>
      )}

      {/* Full Overlay */}
      {phase !== "idle" && (
        <div className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-2xl transition-all duration-500">
          <button onClick={closeAssistant} className="absolute top-8 right-8 text-white/30 hover:text-white text-3xl">✕</button>

          {/* Visual Orb */}
          <div className="relative w-48 h-48 mb-12">
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse
              ${phase === "listening" ? "bg-red-500" : "bg-saffron"}`} />
            
            <div className={`relative w-full h-full rounded-full border-2 flex items-center justify-center transition-all duration-500
              ${phase === "listening" ? "border-red-500 bg-red-500/10 scale-110" : "border-saffron/40 bg-saffron/5"}`}>
              
              {phase === "listening" ? (
                <div className="flex gap-1 items-end h-8">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-1.5 bg-red-400 rounded-full animate-wave" style={{animationDelay: `${i*0.1}s`}} />
                  ))}
                </div>
              ) : (
                <span className="text-6xl">{phase === "error" ? "❌" : "✨"}</span>
              )}
            </div>
          </div>

          <h3 className="text-white text-4xl font-display font-bold mb-4 tracking-tight">
            {phase === "listening" ? "I'm Listening..." : phase === "responding" ? "One Moment..." : phase === "error" ? "Something went wrong" : "SevaSetu AI"}
          </h3>
          
          <p className="text-saffron text-lg font-medium mb-8 max-w-md text-center px-6">
            {phase === "listening" ? "What government service do you need?" : phase === "error" ? errorMessage : response || "How can I assist you today?"}
          </p>

          {transcript && (
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 max-w-2xl text-center shadow-xl mb-8">
              <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-2">Transcript</p>
              <p className="text-white text-2xl font-medium italic">&quot;{transcript}&quot;</p>
            </div>
          )}

          {phase === "awake" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl px-6">
              {[
                { label: "View Schemes", icon: "🏛️" },
                { label: "File Grievance", icon: "📝" },
                { label: "Dashboard", icon: "📊" },
                { label: "Eligibility", icon: "⚖️" },
                { label: "Women Schemes", icon: "👩" },
                { label: "BPL Assist", icon: "🤲" },
              ].map(cmd => (
                <button key={cmd.label} 
                  onClick={() => handleCommand(cmd.label)}
                  className="bg-white/5 border border-white/10 hover:border-saffron/50 hover:bg-saffron/10 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                  <span className="text-2xl">{cmd.icon}</span>
                  <span className="text-white/80 text-xs font-bold uppercase">{cmd.label}</span>
                </button>
              ))}
            </div>
          )}

          {phase === "error" && (
            <button onClick={() => { setPhase("idle"); setTimeout(() => startWakeWord(), 500); }}
              className="mt-8 px-10 py-4 bg-saffron text-white rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
              Try Again
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 32px; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
