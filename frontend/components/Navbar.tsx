"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { animateNavbar } from "@/lib/gsap";
import { useLanguage, SupportedLanguage } from "@/lib/LanguageContext";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/schemes", label: "Schemes" },
    { href: "/eligibility", label: "Eligibility" },
    { href: "/chat", label: "AI Chat" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/grievance", label: "Grievance" },
];

const ADMIN_NAV_LINKS = [
    { href: "/admin", label: "Admin Panel" },
    { href: "/admin/analytics", label: "Analytics" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        animateNavbar("main-navbar");
    }, []);

    const { language, setLanguage, translate } = useLanguage();

    return (
        <>
            <nav
                id="main-navbar"
                className="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-all"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-saffron flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-6 h-6">
                                    <path d="M12 2L4 10v10a2 2 0 002 2h12a2 2 0 002-2V10l-8-8z" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display text-xl leading-none text-white tracking-wide">
                                    Seva<span className="text-saffron font-extrabold tracking-tight">Setu</span>
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Government of India</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-6">
                            {(pathname?.startsWith("/admin") ? ADMIN_NAV_LINKS : NAV_LINKS).map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`nav-link ${pathname === link.href ? "active" : ""}`}
                                >
                                    {translate(link.label)}
                                </Link>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                                className="input-dark text-sm px-3 py-1.5 rounded-lg bg-card-bg border border-card-border font-body cursor-pointer"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी (Hindi)</option>
                                <option value="te">తెలుగు (Telugu)</option>
                                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                                <option value="mr">मराठी (Marathi)</option>
                                <option value="ta">தமிழ் (Tamil)</option>
                            </select>
                            <Link
                                href={pathname?.startsWith("/admin") ? "/" : "/dashboard"}
                                className="btn-saffron px-4 py-1.5 rounded-lg text-sm font-medium"
                            >
                                {pathname?.startsWith("/admin") ? translate("Logout Official") : translate("My Account")}
                            </Link>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex flex-col gap-1.5 p-2"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                            <span className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                            <span className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-72 bg-card-bg border-l border-card-border z-[100] transform transition-transform duration-300 ease-in-out md:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full p-6 pt-20">
                    <button
                        className="absolute top-4 right-4 text-muted hover:text-text-primary text-2xl"
                        onClick={() => setMenuOpen(false)}
                    >
                        ✕
                    </button>
                    {(pathname?.startsWith("/admin") ? ADMIN_NAV_LINKS : NAV_LINKS).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`py-3 border-b border-card-border text-sm font-medium transition-colors ${pathname === link.href ? "text-saffron" : "text-muted hover:text-text-primary"
                                }`}
                        >
                            {translate(link.label)}
                        </Link>
                    ))}
                    <div className="mt-6">
                        <Link
                            href="/dashboard"
                            className="btn-saffron w-full block text-center px-4 py-2.5 rounded-lg text-sm font-medium"
                            onClick={() => setMenuOpen(false)}
                        >
                            My Account
                        </Link>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[90] md:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}
        </>
    );
}
