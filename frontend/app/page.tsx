"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/LanguageContext";
import gsap from "gsap";

export default function LanguageSelectionPage() {
    const { setLanguage, translate } = useLanguage();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState<SupportedLanguage | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (titleRef.current) {
                gsap.from(titleRef.current, { y: 20, opacity: 0, duration: 0.8, ease: "power2.out" });
            }
            if (gridRef.current) {
                gsap.from(gridRef.current.children, { y: 10, opacity: 0, duration: 0.3, stagger: 0.03, ease: "power1.out", delay: 0.2 });
            }
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSelect = (lang: SupportedLanguage) => {
        setSelected(lang);
        setLanguage(lang);
        gsap.to(containerRef.current, {
            opacity: 0, y: -10, duration: 0.4, ease: "power2.inOut",
            onComplete: () => { router.push("/login"); }
        });
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-[#050505] flex flex-col items-center justify-start p-6 lg:p-12 overflow-y-auto relative pt-12 pb-16">
            
            {/* Tricolor bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#ff6b00] via-white to-[#138808]" />

            <div className="z-10 w-full max-w-5xl flex flex-col items-center">
                <div ref={titleRef} className="text-center mb-10">
                    {/* Gov Emblem */}
                    <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 p-2">
                        <span className="text-5xl">🏛️</span>
                    </div>
                    
                    {/* NSWP Badge */}
                    <div className="mb-4 inline-block bg-saffron/10 border border-saffron/30 rounded-full px-5 py-1.5">
                        <span className="text-saffron text-xs font-bold uppercase tracking-[0.3em]">{translate("National Single Window Portal")}</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
                        Seva<span className="text-saffron">Setu</span>
                    </h1>
                    <div className="h-1 w-32 bg-gradient-to-r from-saffron via-white to-[#138808] mx-auto mb-4 rounded-full opacity-70" />
                    
                    <p className="text-lg md:text-xl text-text-primary font-medium mb-2">
                        {translate("Select Your Language")}
                    </p>
                    <p className="text-muted text-[10px] tracking-widest mb-5 uppercase">
                        Digital India • Government of India
                    </p>

                    {/* Feature badges */}
                    <div className="flex flex-wrap justify-center gap-2 mb-2">
                        {[
                            { icon: "🎙️", label: "Hey SevaSetu AI" },
                            { icon: "🤟", label: "Sign Language (ISL)" },
                            { icon: "♿", label: "Accessibility Tools" },
                            { icon: "🗺️", label: "All 28 States + 8 UTs" },
                            { icon: "👩", label: "Women & BPL Schemes" },
                            { icon: "👑", label: "PM Schemes" },
                        ].map(f => (
                            <span key={f.label} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                                {f.icon} {translate(f.label)}
                            </span>
                        ))}
                    </div>
                </div>

                <div 
                    ref={gridRef}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full"
                    role="listbox"
                    aria-label="Select your preferred language"
                >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            role="option"
                            aria-selected={selected === lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`relative overflow-hidden p-6 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${
                                selected === lang.code 
                                ? 'border-saffron bg-saffron/10 ring-1 ring-saffron/50' 
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                            }`}
                        >
                            <span className="text-2xl font-bold font-display text-white">{lang.native}</span>
                            <span className="text-xs font-medium text-muted uppercase tracking-tighter">{lang.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="absolute bottom-16 text-center z-10 w-full">
                <Link 
                    href="/admin/login" 
                    className="text-[10px] text-muted/60 hover:text-saffron transition-colors uppercase tracking-[0.2em] font-bold py-2 px-4 rounded-full border border-white/5 hover:border-saffron/20 hover:bg-saffron/5"
                >
                    🔐 {translate("System Admin Login")}
                </Link>
            </div>
            
            <div className="absolute bottom-6 text-center text-[9px] text-muted/30 z-10 w-full uppercase tracking-[0.2em] font-bold">
                Digital India • SevaSetu NSWP v2.0 • © 2025 Govt of India
            </div>
        </div>
    );
}
