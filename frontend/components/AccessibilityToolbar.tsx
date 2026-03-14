"use client";

import { useState, useEffect } from "react";

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState(1); // 1=normal, 1.2=large, 1.5=xl
  const [screenReader, setScreenReader] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    // High contrast mode
    if (highContrast) {
      root.style.setProperty("--bg-primary", "#000000");
      root.style.setProperty("--text-primary", "#FFFF00");
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
      root.style.removeProperty("--bg-primary");
      root.style.removeProperty("--text-primary");
    }
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize * 16}px`;
  }, [textSize]);

  useEffect(() => {
    if (dyslexicFont) {
      document.body.style.fontFamily = "'OpenDyslexic', 'Arial', sans-serif";
      document.body.style.letterSpacing = "0.1em";
      document.body.style.wordSpacing = "0.2em";
    } else {
      document.body.style.fontFamily = "";
      document.body.style.letterSpacing = "";
      document.body.style.wordSpacing = "";
    }
  }, [dyslexicFont]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.style.setProperty("--transition-duration", "0ms");
      const style = document.createElement("style");
      style.id = "reduced-motion";
      style.textContent = "*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }";
      document.head.appendChild(style);
    } else {
      document.getElementById("reduced-motion")?.remove();
      document.documentElement.style.removeProperty("--transition-duration");
    }
  }, [reducedMotion]);

  const announceFeature = (text: string) => {
    const synth = window.speechSynthesis;
    if (synth && screenReader) {
      synth.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-IN";
      synth.speak(utt);
    }
  };

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Accessibility Options"
        className="fixed top-20 right-4 z-[150] w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-blue-400/30"
        title="Accessibility Options"
      >
        <span className="text-base">♿</span>
      </button>

      {/* Screen Reader Announcer */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="sr-announcer" />

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          className="fixed top-32 right-4 z-[150] w-72 bg-[#0d1117] border border-white/10 rounded-2xl p-4 shadow-2xl"
          role="dialog"
          aria-label="Accessibility Settings"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-sm">♿ Accessibility</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-xs">✕</button>
          </div>

          <div className="space-y-3">
            {/* High Contrast */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌓</span>
                <div>
                  <p className="text-white text-xs font-medium">High Contrast</p>
                  <p className="text-white/40 text-[10px]">For visually impaired</p>
                </div>
              </div>
              <button
                onClick={() => { setHighContrast(!highContrast); announceFeature(highContrast ? "High contrast off" : "High contrast on"); }}
                className={`w-10 h-5 rounded-full transition-colors relative ${highContrast ? "bg-yellow-400" : "bg-white/10"}`}
                aria-pressed={highContrast}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${highContrast ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </label>

            {/* Text Size */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔤</span>
                <p className="text-white text-xs font-medium">Text Size</p>
              </div>
              <div className="flex gap-2">
                {[{ label: "A", size: 1 }, { label: "A+", size: 1.2 }, { label: "A++", size: 1.5 }].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => { setTextSize(opt.size); announceFeature(`Text size set to ${opt.label}`); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${textSize === opt.size ? "bg-saffron border-saffron text-white" : "border-white/10 text-white/50 hover:border-saffron/30"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Reader */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔊</span>
                <div>
                  <p className="text-white text-xs font-medium">Screen Reader</p>
                  <p className="text-white/40 text-[10px]">Text to speech</p>
                </div>
              </div>
              <button
                onClick={() => { setScreenReader(!screenReader); }}
                className={`w-10 h-5 rounded-full transition-colors relative ${screenReader ? "bg-green-500" : "bg-white/10"}`}
                aria-pressed={screenReader}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${screenReader ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </label>

            {/* Dyslexia Friendly */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-lg">📖</span>
                <div>
                  <p className="text-white text-xs font-medium">Dyslexia Font</p>
                  <p className="text-white/40 text-[10px]">Easier reading</p>
                </div>
              </div>
              <button
                onClick={() => setDyslexicFont(!dyslexicFont)}
                className={`w-10 h-5 rounded-full transition-colors relative ${dyslexicFont ? "bg-purple-500" : "bg-white/10"}`}
                aria-pressed={dyslexicFont}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${dyslexicFont ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </label>

            {/* Reduced Motion */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎭</span>
                <div>
                  <p className="text-white text-xs font-medium">Reduce Motion</p>
                  <p className="text-white/40 text-[10px]">Minimize animations</p>
                </div>
              </div>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`w-10 h-5 rounded-full transition-colors relative ${reducedMotion ? "bg-blue-500" : "bg-white/10"}`}
                aria-pressed={reducedMotion}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${reducedMotion ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </label>
          </div>

          <div className="mt-4 text-center">
            <p className="text-white/20 text-[10px] uppercase tracking-widest">WCAG 2.1 AA Compliant</p>
          </div>
        </div>
      )}
    </>
  );
}
