"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/LanguageContext";
import gsap from "gsap";

export default function LanguageSelectionPage() {
    const { setLanguage } = useLanguage();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    
    const [selected, setSelected] = useState<SupportedLanguage | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Professional sequence - smooth fades
            if (titleRef.current) {
                gsap.from(titleRef.current, {
                    y: 20,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            }

            if (gridRef.current) {
                gsap.from(gridRef.current.children, {
                    y: 10,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power1.out",
                    delay: 0.3
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleSelect = (lang: SupportedLanguage) => {
        setSelected(lang);
        setLanguage(lang);
        
        // Exit animation - simple and professional
        gsap.to(containerRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                router.push("/login"); // Route to login first
            }
        });
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto relative py-12">
            
            {/* Background elements - very subtle */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#ff6b00] via-white to-[#138808] opacity-50" />

            <div className="z-10 w-full max-w-5xl flex flex-col items-center">
                <div ref={titleRef} className="text-center mb-12">
                    {/* Emblem Placeholder - More official */}
                    <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 p-4">
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-saffron w-12 h-12">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        SevaSetu <span className="text-saffron">Portal</span>
                    </h1>
                    <div className="h-1 w-24 bg-saffron mx-auto mb-6 rounded-full" />
                    
                    <p className="text-xl md:text-2xl text-text-primary font-medium">
                        Select Your Preferred Language
                    </p>
                    <p className="text-muted mt-3 text-sm tracking-wide">
                        भारत सरकार • DIGITAL INDIA • GOVERNMENT OF INDIA
                    </p>
                </div>

                <div 
                    ref={gridRef}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full"
                >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleSelect(lang.code)}
                            className={`relative overflow-hidden p-6 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${
                                selected === lang.code 
                                ? 'border-saffron bg-saffron/10 ring-1 ring-saffron/50' 
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                            }`}
                        >
                            <span className="text-2xl font-bold font-display text-white">
                                {lang.native}
                            </span>
                            <span className="text-xs font-medium text-muted uppercase tracking-tighter">
                                {lang.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="absolute bottom-16 text-center z-10 w-full">
                <Link 
                    href="/admin/login" 
                    className="text-[10px] text-muted/60 hover:text-saffron transition-colors uppercase tracking-[0.2em] font-bold py-2 px-4 rounded-full border border-white/5 hover:border-saffron/20 hover:bg-saffron/5"
                >
                    System Admin Login
                </Link>
            </div>
            
            <div className="absolute bottom-8 text-center text-[10px] text-muted/40 z-10 w-full uppercase tracking-[0.2em] font-bold">
                National Informatics Centre (NIC) • Digital India Initiatives • SevaSetu v1.1
            </div>
        </div>
    );
}
