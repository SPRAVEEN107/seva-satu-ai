"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
    animateHero,
    animateCounter,
    addCardTilt,
    gsap,
} from "@/lib/gsap";

const FLOATING_SCHEMES = [
    { label: "PM Kisan", emoji: "🌾", color: "rgba(19,136,8,0.6)" },
    { label: "PMAY", emoji: "🏠", color: "rgba(0,71,171,0.6)" },
    { label: "Ayushman Bharat", emoji: "🏥", color: "rgba(255,107,0,0.6)" },
    { label: "MUDRA Loan", emoji: "💼", color: "rgba(139,92,246,0.6)" },
    { label: "Ujjwala Yojana", emoji: "🔥", color: "rgba(19,136,8,0.6)" },
];

const STATS = [
    { suffix: "+", number: 1000, label: "Schemes Available", color: "text-saffron" },
    { suffix: "", number: 28, label: "States Covered", color: "text-cobalt" },
    { suffix: "M+", number: 500, label: "Citizens Can Benefit", color: "text-india-green" },
];

const FEATURES = [
    {
        icon: "✨",
        title: "AI Scheme Discovery",
        desc: "Tell AI your situation, get a personalized scheme list in seconds.",
        color: "#FF6B00",
    },
    {
        icon: "🎤",
        title: "Voice Assistant",
        desc: "Speak in Hindi, Telugu, Kannada, Marathi, or Tamil — AI understands.",
        color: "#0047AB",
    },
    {
        icon: "✅",
        title: "Eligibility Checker",
        desc: "Instant prediction — no forms, just 4 quick questions.",
        color: "#138808",
    },
    {
        icon: "📝",
        title: "Auto Form Filling",
        desc: "AI fills government forms from your conversational answers.",
        color: "#FF6B00",
    },
    {
        icon: "📋",
        title: "Grievance Tracking",
        desc: "File complaints and track resolution in real-time with AI.",
        color: "#0047AB",
    },
    {
        icon: "📱",
        title: "Offline SMS Mode",
        desc: "Works even with no internet — send SMS to get scheme info.",
        color: "#138808",
    },
];

const LANGUAGES = [
    { code: "hi", label: "हिंदी" },
    { code: "te", label: "తెలుగు" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "mr", label: "मराठी" },
    { code: "ta", label: "தமிழ்" },
    { code: "en", label: "English" },
];

export default function HeroSection() {
    const heroBgRef = useRef<HTMLDivElement>(null);
    const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        // Hero entrance
        animateHero(".hero-word");

        // Stats counters
        STATS.forEach((stat, i) => {
            const el = counterRefs.current[i];
            if (el) animateCounter(el, stat.number);
        });

        // Card tilt
        cardRefs.current.forEach((card) => {
            if (card) addCardTilt(card);
        });

        // Floating cards oscillation
        floatingRefs.current.forEach((card, i) => {
            if (!card) return;
            gsap.to(card, {
                y: -20,
                duration: 3 + i * 0.5,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: i * 0.3,
            });
        });

        // Scroll arrow bounce
        gsap.to("#scroll-arrow", {
            y: 8,
            duration: 0.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
        });

        // How it works step animations
        gsap.from("#step-1", {
            x: -80,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: "#how-it-works", start: "top 75%", once: true },
        });
        gsap.from("#step-2", {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.15,
            scrollTrigger: { trigger: "#how-it-works", start: "top 75%", once: true },
        });
        gsap.from("#step-3", {
            x: 80,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.3,
            scrollTrigger: { trigger: "#how-it-works", start: "top 75%", once: true },
        });

        // Dashed line animation
        const line = document.getElementById("connect-line");
        if (line) {
            gsap.fromTo(
                line,
                { strokeDashoffset: 400 },
                {
                    strokeDashoffset: 0,
                    duration: 1.5,
                    ease: "power2.out",
                    scrollTrigger: { trigger: "#how-it-works", start: "top 75%", once: true },
                }
            );
        }
    }, []);

    return (
        <>
            {/* ─── HERO ─────────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden mesh-bg">
                {/* Floating scheme badges */}
                <div className="absolute inset-0 pointer-events-none">
                    {FLOATING_SCHEMES.map((s, i) => (
                        <div
                            key={s.label}
                            ref={(el) => { floatingRefs.current[i] = el; }}
                            className="floating-card absolute"
                            style={{
                                top: `${15 + i * 15}%`,
                                left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
                                right: i % 2 !== 0 ? `${5 + i * 2}%` : undefined,
                                borderColor: s.color,
                                opacity: 0.7,
                            }}
                        >
                            {s.emoji} {s.label}
                        </div>
                    ))}
                </div>

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    {/* Pill label */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-saffron/30 bg-saffron/10 text-saffron text-sm font-medium mb-8 hero-word">
                        🇮🇳 Made for Bharat — AI-Powered Governance
                    </div>

                    {/* Headline */}
                    <h1 className="font-display text-5xl md:text-7xl text-text-primary leading-tight mb-6">
                        {"Sarkar Ko".split(" ").map((word, i) => (
                            <span key={i} className="hero-word inline-block mr-4">
                                {word}
                            </span>
                        ))}
                        <span className="hero-word inline-block saffron-text mr-4">Aapke</span>
                        {"Paas Laate Hain".split(" ").map((word, i) => (
                            <span key={i} className="hero-word inline-block mr-4">
                                {word}
                            </span>
                        ))}
                    </h1>

                    <p className="hero-word text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
                        AI-powered access to <span className="text-saffron font-semibold">1000+ government schemes</span> in your language. Find eligibility, apply, and track — all in minutes.
                    </p>

                    <div className="hero-word flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/eligibility"
                            className="btn-saffron px-8 py-3.5 rounded-xl text-base font-semibold inline-flex items-center gap-2 group"
                        >
                            Find My Schemes
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        <Link
                            href="/chat"
                            className="btn-outline px-8 py-3.5 rounded-xl text-base font-semibold inline-flex items-center gap-2"
                        >
                            Talk to AI Assistant 🎤
                        </Link>
                    </div>
                </div>

                {/* Scroll arrow */}
                <div id="scroll-arrow" className="absolute bottom-8 text-muted text-2xl cursor-pointer">
                    ↓
                </div>
            </section>

            {/* ─── STATS ────────────────────────────────────────────────────────── */}
            <section className="py-20 bg-card-bg border-y border-card-border">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {STATS.map((stat, i) => (
                            <div
                                key={i}
                                className="text-center p-8 rounded-2xl border border-card-border glass-card border-t-2"
                                style={{ borderTopColor: i === 0 ? "#FF6B00" : i === 1 ? "#0047AB" : "#138808" }}
                            >
                                <div className={`text-5xl font-bold ${stat.color} font-display flex items-center justify-center gap-1`}>
                                    <span
                                        ref={(el) => { counterRefs.current[i] = el; }}
                                        className="tabular-nums"
                                    >
                                        0
                                    </span>
                                    <span>{stat.suffix}</span>
                                </div>
                                <p className="text-muted mt-2 text-sm font-medium uppercase tracking-wider">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
            <section id="how-it-works" className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl text-center text-text-primary mb-4">
                        3 Steps to Your Benefits
                    </h2>
                    <p className="text-muted text-center mb-16">Simple, fast, and free for every citizen</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting line (desktop only) */}
                        <svg
                            className="hidden md:block absolute top-12 left-1/4 right-1/4 w-1/2 h-1 pointer-events-none"
                            style={{ top: "3rem" }}
                        >
                            <line
                                id="connect-line"
                                x1="0" y1="0" x2="100%" y2="0"
                                stroke="#FF6B00" strokeWidth="2"
                                strokeDasharray="8 4"
                                strokeDashoffset="400"
                            />
                        </svg>

                        {[
                            { id: "step-1", icon: "👤", step: "01", title: "Tell Us About Yourself", desc: "Share your state, income, occupation — takes 60 seconds." },
                            { id: "step-2", icon: "✨", step: "02", title: "AI Finds Your Schemes", desc: "Our AI scans 1000+ schemes and ranks your best matches." },
                            { id: "step-3", icon: "🚀", step: "03", title: "Apply in Minutes", desc: "Apply directly or get step-by-step guidance to the portal." },
                        ].map((s) => (
                            <div key={s.id} id={s.id} className="text-center glass-card rounded-2xl p-8">
                                <div className="w-16 h-16 rounded-2xl bg-saffron-gradient flex items-center justify-center text-2xl mx-auto mb-4">
                                    {s.icon}
                                </div>
                                <div className="text-saffron font-mono text-xs mb-2 tracking-widest">{s.step}</div>
                                <h3 className="font-display text-xl text-text-primary mb-2">{s.title}</h3>
                                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURES GRID ────────────────────────────────────────────────── */}
            <section className="py-24 px-4 bg-card-bg border-y border-card-border">
                <div className="max-w-6xl mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl text-center text-text-primary mb-4">
                        Everything You Need
                    </h2>
                    <p className="text-muted text-center mb-16">Powered by AI. Built for Bharat.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 feature-cards">
                        {FEATURES.map((feat, i) => (
                            <div
                                key={i}
                                ref={(el) => { cardRefs.current[i] = el; }}
                                className="scheme-card glass-card rounded-2xl p-6 cursor-default feature-card"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                                    style={{ backgroundColor: `${feat.color}20`, border: `1px solid ${feat.color}40` }}
                                >
                                    {feat.icon}
                                </div>
                                <h3 className="font-display text-lg text-text-primary mb-2">{feat.title}</h3>
                                <p className="text-muted text-sm leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── LANGUAGE BAR ─────────────────────────────────────────────────── */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-display text-2xl text-text-primary mb-2">
                        Speak in Your Language
                    </h2>
                    <p className="text-muted text-sm mb-8">Savasetu AI understands your mother tongue</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                className="px-5 py-2.5 rounded-full border border-card-border text-sm font-medium text-muted hover:border-saffron hover:text-saffron hover:bg-saffron/10 transition-all duration-200"
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
            <footer className="border-t border-card-border py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left">
                            <div className="font-display text-2xl mb-1">
                                Sava<span className="text-saffron">setu</span>
                            </div>
                            <p className="text-muted text-sm">One AI platform connecting every citizen to every government service</p>
                        </div>
                        <div className="flex gap-6 text-sm text-muted">
                            <Link href="/schemes" className="hover:text-saffron transition-colors">Schemes</Link>
                            <Link href="/eligibility" className="hover:text-saffron transition-colors">Eligibility</Link>
                            <Link href="/chat" className="hover:text-saffron transition-colors">AI Chat</Link>
                            <Link href="/grievance" className="hover:text-saffron transition-colors">Grievance</Link>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-card-border flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-muted text-xs">© 2025 Savasetu AI. Made with ❤️ for Bharat 🇮🇳</p>
                        <a
                            href="https://github.com/savasetu-ai"
                            className="text-xs text-muted hover:text-saffron transition-colors flex items-center gap-2"
                        >
                            ⭐ GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
