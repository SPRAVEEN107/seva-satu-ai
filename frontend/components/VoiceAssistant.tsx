"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VoiceAssistant() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "awake" | "listening" | "responding">("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recRef = useRef<any>(null);
  const wakeRef = useRef<any>(null);

  // ── Speak helper ──────────────────────────────────────────────
  const speak = (text: string, onDone?: () => void) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    u.rate = 1.0;
    u.pitch = 1.1;
    if (onDone) u.onend = onDone;
    window.speechSynthesis.speak(u);
  };

  // ── Route commands ─────────────────────────────────────────────
  const handleCommand = (text: string) => {
    const t = text.toLowerCase();
    let reply = "";
    let path = "";

    if (t.match(/scheme|yojana|योजना|திட்டம்|women|महिला|bpl|pm scheme/)) {
      path = "/schemes"; reply = "Opening Government Schemes";
    } else if (t.match(/grievance|complaint|शिकायत|புகார்|register/)) {
      path = "/grievance"; reply = "Opening Complaint Registration";
    } else if (t.match(/dashboard|home|डैशबोर्ड/)) {
      path = "/dashboard"; reply = "Going to your Dashboard";
    } else if (t.match(/eligib|पात्रता|தகுதி|check/)) {
      path = "/eligibility"; reply = "Checking your eligibility";
    } else if (t.match(/chat|help|मदद|support/)) {
      path = "/chat"; reply = "Opening AI Chat";
    } else if (t.match(/track|status|ट्रैक/)) {
      path = "/grievance"; reply = "Opening complaint tracking";
    } else {
      reply = "Say: Schemes, Grievance, Dashboard, Eligibility, or Chat";
    }

    setResponse(reply);
    speak(reply, () => {
      if (path) {
        setPhase("idle");
        router.push(path);
      } else {
        setPhase("awake");
        startCommandListen();
      }
    });
  };

  // ── Listen for one command ─────────────────────────────────────
  const startCommandListen = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    if (recRef.current) { try { recRef.current.abort(); } catch {} }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setPhase("listening");
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setTranscript(t);
    };
    rec.onend = () => {
      const finalTranscript = transcript;
      if (finalTranscript.trim()) {
        setPhase("responding");
        handleCommand(finalTranscript);
      } else {
        setPhase("idle");
        startWakeWord();
      }
    };
    rec.onerror = () => { setPhase("idle"); startWakeWord(); };
    recRef.current = rec;
    rec.start();
  };

  // ── Wake word listener (always on) ────────────────────────────
  const startWakeWord = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
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
      const matched =
        heard.includes("hey sevasetu") ||
        heard.includes("sevasetu") ||
        heard.includes("seva setu") ||
        heard.includes("hey seva") ||
        heard.includes("हे सेवासेतु") ||
        heard.includes("सेवासेतु");

      if (matched) {
        try { wake.abort(); } catch {}
        setPhase("awake");
        setTranscript("");
        setResponse("");
        speak("Hello! I am SevaSetu. How can I help you today?", () => {
          startCommandListen();
        });
      }
    };

    wake.onend = () => {
      // Restart if not woken
      if (phase === "idle") {
        setTimeout(() => startWakeWord(), 300);
      }
    };
    wake.onerror = (e: any) => {
      if (e.error !== "aborted") {
        setTimeout(() => startWakeWord(), 1000);
      }
    };

    wakeRef.current = wake;
    try { wake.start(); } catch {}
  };

  // Boot wake word on mount
  useEffect(() => {
    const t = setTimeout(() => startWakeWord(), 500);
    return () => {
      clearTimeout(t);
      if (wakeRef.current) try { wakeRef.current.abort(); } catch {}
      if (recRef.current) try { recRef.current.abort(); } catch {}
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ── Manual activate ────────────────────────────────────────────
  const manualActivate = () => {
    if (wakeRef.current) try { wakeRef.current.abort(); } catch {}
    setPhase("awake");
    setTranscript("");
    setResponse("");
    speak("Hello! I am SevaSetu. Please tell me what you need.", () => {
      startCommandListen();
    });
  };

  const closeAssistant = () => {
    setPhase("idle");
    setTranscript("");
    setResponse("");
    if (recRef.current) try { recRef.current.abort(); } catch {}
    window.speechSynthesis?.cancel();
    setTimeout(() => startWakeWord(), 500);
  };

  // ── UI ─────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating mic button — always visible on every page */}
      <button
        onClick={manualActivate}
        aria-label="Activate SevaSetu Voice Assistant"
        className={`
          fixed bottom-8 right-8 z-[9999] w-16 h-16 rounded-full
          flex flex-col items-center justify-center gap-0.5
          shadow-[0_0_30px_rgba(255,107,0,0.6)] transition-all duration-200
          hover:scale-110 active:scale-95
          ${phase === "listening"
            ? "bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.8)]"
            : phase === "awake" || phase === "responding"
            ? "bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]"
            : "bg-gradient-to-br from-[#FF6B00] to-[#FF8C00]"
          }
        `}
      >
        <span className="text-xl">
          {phase === "listening" ? "🎙️" : phase === "responding" ? "💬" : "🎙️"}
        </span>
        <span className="text-[8px] font-black text-white/90 tracking-tight">SETU</span>
      </button>

      {/* Wake-word hint bubble */}
      {phase === "idle" && (
        <div className="fixed bottom-28 right-6 z-[9998] bg-black/80 backdrop-blur border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white/60 font-medium pointer-events-none">
          Say <span className="text-saffron font-bold">&quot;Hey SevaSetu&quot;</span>
        </div>
      )}

      {/* Active overlay */}
      {phase !== "idle" && (
        <div className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl">
          {/* Close */}
          <button onClick={closeAssistant}
            className="absolute top-6 right-6 text-white/40 hover:text-white text-2xl leading-none">✕</button>

          {/* Pulsing orb */}
          <div className="relative mb-8">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center
              ${phase === "listening"
                ? "bg-red-500/20 border-2 border-red-400"
                : "bg-saffron/20 border-2 border-saffron/60"}`}>
              <span className="text-5xl">
                {phase === "listening" ? "🎙️" : phase === "responding" ? "💬" : "✨"}
              </span>
            </div>
            {phase === "listening" && (
              <>
                <div className="absolute inset-0 w-28 h-28 rounded-full bg-red-400/30 animate-ping" />
                <div className="absolute -inset-4 w-36 h-36 rounded-full border border-saffron/20 animate-spin" style={{ animationDuration: "3s" }} />
              </>
            )}
          </div>

          {/* Status text */}
          <h2 className="text-white text-3xl font-display font-bold mb-2">
            {phase === "listening" ? "Listening..." : phase === "responding" ? "Got it!" : "नमस्ते! SevaSetu"}
          </h2>
          <p className="text-saffron text-sm mb-6">
            {phase === "listening" ? "Speak your command now" : phase === "responding" ? response : "Your AI Government Assistant"}
          </p>

          {/* Transcript */}
          {transcript && (
            <div className="max-w-lg text-center px-6 mb-4">
              <p className="text-white text-xl font-light">{transcript}</p>
            </div>
          )}

          {/* Quick command chips */}
          {phase === "awake" && (
            <div className="flex flex-wrap gap-2 justify-center max-w-md px-4 mt-2">
              {[
                ["Schemes", "/schemes"],
                ["Grievance", "/grievance"],
                ["Dashboard", "/dashboard"],
                ["Eligibility", "/eligibility"],
                ["Women Schemes", "/schemes"],
                ["BPL Schemes", "/schemes"],
              ].map(([label, path]) => (
                <button key={label}
                  onClick={() => { setPhase("idle"); router.push(path); }}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-saffron/10 hover:border-saffron/40 transition-all">
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Manual mic in awake state */}
          {phase === "awake" && (
            <button onClick={startCommandListen}
              className="mt-6 px-8 py-3 rounded-full bg-saffron text-white font-bold text-sm hover:bg-orange-600 transition-all">
              🎙️ Speak Now
            </button>
          )}
        </div>
      )}
    </>
  );
}
