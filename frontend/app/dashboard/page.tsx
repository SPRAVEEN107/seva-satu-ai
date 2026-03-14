"use client";

import { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const STATS = [
    { label: "Eligible Government Schemes", value: 12, color: "#FF6B00", icon: "🎯" },
    { label: "Total Applications Filed", value: 3, color: "#0047AB", icon: "📋" },
    { label: "Verification In Progress", value: 2, color: "#FFC107", icon: "⏳" },
    { label: "Approved Benefits", value: 1, color: "#138808", icon: "✅" },
];

const APPLICATIONS = [
    { scheme: "PM Kisan Samman Nidhi", ref: "SAV-20250310-A1B2C3", status: "approved", date: "Mar 05, 2025", next: "Next installment due June 2025" },
    { scheme: "Ayushman Bharat PM-JAY", ref: "SAV-20250308-D4E5F6", status: "under_review", date: "Mar 03, 2025", next: "Documents verification in progress" },
    { scheme: "MGNREGA", ref: "SAV-20250301-G7H8I9", status: "submitted", date: "Mar 01, 2025", next: "Awaiting local authority review" },
];

const NOTIFICATIONS = [
    { text: "PM Kisan installment of ₹2,000 credited to your bank account", time: "2 hours ago", type: "success" },
    { text: "Ayushman Bharat application under document verification", time: "1 day ago", type: "info" },
    { text: "New scheme available: PM Fasal Bima Yojana — You may qualify!", time: "2 days ago", type: "alert" },
];

const QUICK_ACTIONS = [
    { label: "+ Apply for Scheme", href: "/schemes", icon: "🎯", color: "#FF6B00" },
    { label: "📋 Track Application", href: "/dashboard", icon: "📊", color: "#0047AB" },
    { label: "🗣 File Grievance", href: "/grievance", icon: "📢", color: "#138808" },
    { label: "📄 My Documents", href: "/chat", icon: "🗂️", color: "#6F42C1" },
];

export default function DashboardPage() {
    const greetingRef = useRef<HTMLHeadingElement>(null);
    const { language, translate } = useLanguage();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const data = await authClient.getCurrentUser();
            if (data) {
                setUser(data);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        // Greeting typewriter
        const el = greetingRef.current;
        if (el) {
            const userName = user?.name || "Citizen";
            const text = `${translate("Namaste")}, ${userName} 👋`;
            el.textContent = "";
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    el.textContent += text[i];
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 50);
            // cleanup
            const cleanup = () => clearInterval(interval);

            // Stat widgets slide in
            gsap.from(".stat-widget", {
                y: -30, opacity: 0, stagger: 0.1, duration: 0.6, ease: "power3.out", delay: 0.3,
            });
            // Timeline items slide in
            gsap.from(".timeline-item", {
                x: -30, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out", delay: 0.6,
            });
            // Notifications slide from right
            gsap.from(".notif-item", {
                x: 30, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out", delay: 0.8,
            });
            // Pulsing dot for "under review"
            gsap.to(".status-pulse", {
                scale: 1.4, opacity: 0.5, duration: 0.8, ease: "power2.out", yoyo: true, repeat: -1,
            });

            return cleanup;
        }
    }, [language]);

    const handleQuickAction = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const target = e.currentTarget;
        gsap.to(target, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
        });
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#050505] pt-16 relative">
                 {/* Subtle top accent */}
                 <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-saffron/20 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 py-10">
                    {/* Greeting */}
                    <h1
                        ref={greetingRef}
                        className="font-display text-2xl md:text-3xl text-text-primary mb-8"
                    />

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {STATS.map((stat, i) => (
                            <div
                                key={i}
                                className="stat-widget glass-card rounded-2xl p-5 border border-card-border"
                                style={{ borderTopColor: stat.color, borderTopWidth: "2px" }}
                            >
                                <div className="text-3xl mb-1">{stat.icon}</div>
                                <div className="text-3xl font-bold font-display" style={{ color: stat.color }}>
                                    {stat.value}
                                </div>
                                <div className="text-xs text-muted mt-1">{translate(stat.label)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Applications Timeline */}
                        <div className="lg:col-span-2">
                            <h2 className="font-display text-lg text-text-primary mb-4">{translate("Active Applications")}</h2>
                            <div className="space-y-3">
                                {APPLICATIONS.map((app, i) => (
                                    <div key={i} className="timeline-item glass-card rounded-xl p-4 border border-card-border flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="relative w-3 h-3">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${app.status === "approved" ? "bg-india-green" : app.status === "under_review" ? "bg-amber-400" : "bg-saffron"}`}
                                                />
                                                {app.status === "under_review" && (
                                                    <div className="status-pulse absolute inset-0 rounded-full bg-amber-400 opacity-50" />
                                                )}
                                            </div>
                                            {i < APPLICATIONS.length - 1 && (
                                                <div className="w-0.5 flex-1 bg-card-border mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-semibold text-text-primary">{app.scheme}</h3>
                                                <span className={`badge text-xs flex-shrink-0 status-${app.status}`}>
                                                    {app.status.replace("_", " ")}
                                                </span>
                                            </div>
                                            <p className="text-xs font-mono text-muted mt-0.5">{app.ref}</p>
                                            <p className="text-xs text-muted mt-1">{app.next}</p>
                                            <p className="text-xs text-muted/60 mt-0.5">{app.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <h2 className="font-display text-lg text-text-primary mt-6 mb-4">{translate("Quick Actions")}</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {QUICK_ACTIONS.map((action, i) => (
                                    <Link
                                        key={i}
                                        href={action.href}
                                        onClick={handleQuickAction}
                                        className="glass-card rounded-xl p-4 border border-card-border hover:border-saffron/30 transition-all duration-200 text-sm font-medium text-text-primary hover:text-saffron group"
                                        style={{ borderLeftColor: action.color + "40", borderLeftWidth: "2px" }}
                                    >
                                        <span className="group-hover:scale-110 inline-block transition-transform duration-200">
                                            {translate(action.label.replace(/^[^\s\w]+ /, ''))}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div>
                            <h2 className="font-display text-lg text-text-primary mb-4">{translate("Notifications")}</h2>
                            <div className="space-y-3">
                                {NOTIFICATIONS.map((n, i) => (
                                    <div key={i} className="notif-item glass-card rounded-xl p-4 border border-card-border">
                                        <div className="flex gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-india-green" : n.type === "alert" ? "bg-saffron" : "bg-cobalt"}`} />
                                            <div>
                                                <p className="text-xs text-text-primary leading-relaxed">{n.text}</p>
                                                <p className="text-xs text-muted mt-1">{n.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recommended schemes */}
                            <div className="mt-6 glass-card rounded-xl p-4 border border-saffron/20">
                                <h3 className="text-sm font-semibold text-saffron mb-3">✨ {translate("Recommended for You")}</h3>
                                <div className="space-y-2">
                                    {["PM Fasal Bima Yojana", "Kisan Credit Card", "PM Ujjwala Yojana"].map((s) => (
                                        <Link
                                            key={s}
                                            href="/schemes"
                                            className="block text-xs text-muted hover:text-text-primary transition-colors py-1.5 border-b border-card-border last:border-0"
                                        >
                                            → {s}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
