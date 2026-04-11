"use client";

import { useState, useRef, useEffect } from "react";
import { chatAPI, type ChatResponse, type SuggestedScheme } from "@/lib/api";
import { animateTypingDots, gsap } from "@/lib/gsap";
import LanguageSelector from "./LanguageSelector";
import Link from "next/link";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    suggestedSchemes?: SuggestedScheme[];
    actionButtons?: string[];
    timestamp: Date;
}

const QUICK_ACTIONS = [
    { label: "Find Schemes", message: "What government schemes am I eligible for?" },
    { label: "Check Eligibility", message: "Can you check my eligibility for government benefits?" },
    { label: "File Complaint", message: "I want to file a grievance complaint." },
    { label: "Track Application", message: "How can I track my scheme application?" },
];

const CITIZEN_PROFILE = {
    name: "Ramesh Kumar",
    state: "Uttar Pradesh",
    occupation: "Farmer",
};

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "ai",
            content:
                "Namaste! 🙏 I'm Savasetu AI — your guide to all government schemes and services.\n\nTell me about yourself (state, income, occupation) and I'll find the best schemes for you. Or just ask me anything!",
            actionButtons: ["Find Schemes", "Check Eligibility", "File Grievance"],
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [language, setLanguage] = useState("en");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const micRef = useRef<HTMLButtonElement>(null);
    const voiceCleanupRef = useRef<(() => void) | null>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            gsap.to(messagesEndRef.current, {
                scrollTop: messagesEndRef.current.scrollHeight,
                duration: 0.3,
            });
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isLoading && typingRef.current) {
            const cleanup = animateTypingDots(typingRef.current);
            return () => {
                if (cleanup) cleanup();
            };
        }
    }, [isLoading]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Animate new message
        setTimeout(() => {
            const msgEls = document.querySelectorAll<HTMLElement>(".chat-message");
            const last = msgEls[msgEls.length - 1];
            if (last) {
                gsap.from(last, { y: 20, opacity: 0, duration: 0.4, ease: "power2.out" });
            }
        }, 50);

        try {
            const history = messages.map((m) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
            }));

            const res = await chatAPI.sendMessage({
                message: text,
                language,
                history,
                citizen_id: "demo-citizen-uuid", // This should be dynamic in a real app
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: res.data.reply,
                suggestedSchemes: res.data.suggested_schemes,
                actionButtons: res.data.action_buttons,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "ai",
                    content: "I'm having trouble connecting right now. Please try again in a moment.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoice = () => {
        if (isListening) {
            setIsListening(false);
            voiceCleanupRef.current?.();
        } else {
            setIsListening(true);
            // Animate mic pulse
            if (micRef.current) {
                const ring = micRef.current.querySelector<HTMLElement>(".voice-ring");
                if (ring) {
                    const tween = gsap.to(ring, {
                        scale: 1.5,
                        opacity: 0,
                        duration: 0.8,
                        repeat: -1,
                    });
                    voiceCleanupRef.current = () => {
                        tween.kill();
                        if (ring) gsap.set(ring, { scale: 1, opacity: 1 });
                    };
                }
            }

            // Web Speech API (if available)
            if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
                const SpeechRecognition = (window as any).webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.lang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";
                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    setIsListening(false);
                };
                recognition.onerror = () => setIsListening(false);
                recognition.onend = () => setIsListening(false);
                recognition.start();
            } else {
                setTimeout(() => setIsListening(false), 3000);
            }
        }
    };

    return (
        <div className="flex h-screen bg-dark-bg">
            {/* ─── LEFT SIDEBAR ──────────────────────────────── */}
            <aside className="w-72 border-r border-card-border bg-card-bg flex-shrink-0 flex flex-col p-4 overflow-y-auto hidden md:flex">
                {/* Profile card */}
                <div className="glass-card rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-saffron-gradient flex items-center justify-center text-white font-bold">
                            {CITIZEN_PROFILE.name[0]}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">{CITIZEN_PROFILE.name}</p>
                            <p className="text-xs text-muted">{CITIZEN_PROFILE.state}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="badge status-approved text-xs">{CITIZEN_PROFILE.occupation}</span>
                    </div>
                </div>

                {/* Quick actions */}
                <p className="text-xs text-muted uppercase tracking-widest mb-3 px-1">Quick Actions</p>
                <div className="flex flex-col gap-2">
                    {QUICK_ACTIONS.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => sendMessage(action.message)}
                            className="text-left px-4 py-2.5 rounded-xl text-sm text-muted hover:text-text-primary hover:bg-white/5 border border-card-border hover:border-saffron/30 transition-all duration-200"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-card-border">
                    <p className="text-xs text-muted uppercase tracking-widest mb-3 px-1">Language</p>
                    <LanguageSelector selected={language} onChange={setLanguage} className="flex-col" />
                </div>

                <div className="mt-auto pt-4 border-t border-card-border">
                    <Link
                        href="/schemes"
                        className="block text-center btn-saffron px-4 py-2.5 rounded-xl text-sm font-medium"
                    >
                        Browse All Schemes
                    </Link>
                </div>
            </aside>

            {/* ─── CHAT AREA ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-card-border bg-card-bg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-saffron-gradient flex items-center justify-center">
                            <span className="text-white text-xs font-bold">AI</span>
                        </div>
                        <div>
                            <h1 className="font-display text-base text-text-primary">Savasetu AI</h1>
                            <p className="text-xs text-india-green">● Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="input-dark text-xs px-2 py-1.5 rounded-lg border border-card-border font-body bg-card-bg cursor-pointer md:hidden"
                        >
                            <option value="en">EN</option>
                            <option value="hi">HI</option>
                            <option value="te">TE</option>
                            <option value="kn">KN</option>
                            <option value="mr">MR</option>
                            <option value="ta">TA</option>
                        </select>
                        <button
                            onClick={() => setMessages([{
                                id: "welcome",
                                role: "ai",
                                content: "Chat cleared! How can I help you?",
                                timestamp: new Date(),
                            }])}
                            className="text-xs text-muted hover:text-saffron transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                            Clear Chat
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "ai" && (
                                <div className="w-7 h-7 rounded-full bg-cobalt-gradient flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                                    <span className="text-white text-xs">AI</span>
                                </div>
                            )}
                            <div className={`max-w-lg ${msg.role === "user" ? "chat-bubble-user text-white" : "chat-bubble-ai text-text-primary"} px-4 py-3`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                                {/* Suggested schemes */}
                                {msg.suggestedSchemes && msg.suggestedSchemes.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {msg.suggestedSchemes.slice(0, 3).map((s, i) => (
                                            <a
                                                key={i}
                                                href={s.apply_url || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-saffron/40 transition-colors"
                                            >
                                                <p className="text-xs font-semibold text-text-primary">{s.name}</p>
                                                {s.benefit && <p className="text-xs text-saffron">{s.benefit}</p>}
                                                {s.match_score && (
                                                    <p className="text-xs text-muted">{s.match_score}% match</p>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Action buttons */}
                                {msg.actionButtons && msg.actionButtons.length > 0 && msg.role === "ai" && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {msg.actionButtons.map((btn, i) => (
                                            <button
                                                key={i}
                                                onClick={() => sendMessage(btn)}
                                                className="text-xs px-3 py-1.5 rounded-full border border-saffron/40 text-saffron hover:bg-saffron/10 transition-colors"
                                            >
                                                {btn}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="w-7 h-7 rounded-full bg-cobalt-gradient flex-shrink-0 flex items-center justify-center mr-2">
                                <span className="text-white text-xs">AI</span>
                            </div>
                            <div
                                ref={typingRef}
                                className="chat-bubble-ai px-5 py-4 flex items-center gap-1"
                            >
                                <span className="typing-dot w-2 h-2 rounded-full bg-muted inline-block" />
                                <span className="typing-dot w-2 h-2 rounded-full bg-muted inline-block" />
                                <span className="typing-dot w-2 h-2 rounded-full bg-muted inline-block" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="p-4 border-t border-card-border bg-card-bg">
                    {isListening && (
                        <div className="text-center text-saffron text-xs mb-2 animate-pulse">
                            🎤 Listening... Speak now
                        </div>
                    )}
                    <div className="flex gap-2 items-center">
                        <div className="flex-1 flex items-center gap-2 input-dark rounded-xl px-4 py-3 border border-card-border">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                                placeholder="Ask about schemes, eligibility, grievances..."
                                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-muted outline-none font-body"
                            />
                        </div>
                        {/* Voice button */}
                        <button
                            ref={micRef}
                            onClick={toggleVoice}
                            className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isListening ? "bg-red-500/20 border border-red-500/50" : "btn-outline border border-card-border hover:border-saffron/50"
                                }`}
                            aria-label="Voice input"
                        >
                            {isListening && (
                                <span className="voice-ring absolute inset-0 rounded-xl border-2 border-red-500" />
                            )}
                            <span className="text-lg">{isListening ? "⏹" : "🎤"}</span>
                        </button>
                        {/* Send button */}
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                            className="btn-saffron w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-white"
                        >
                            {isLoading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "↑"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
