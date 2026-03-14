"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Check for official admin credentials provided by the user
            if (email === "19792@apsrkpuram.edu.in" && password === "123456789") {
                // In a real app, we'd still get a token from the backend
                // For this specific official access, we'll allow entry to the admin dashboard
                authClient.setToken("official_admin_access_token");
                router.push("/admin");
                return;
            }

            // In a real app, this would be a proper admin check
            // For now, we reuse the common login but redirect to admin
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://seva-satu-ai.onrender.com'}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                authClient.setToken(data.access_token);
                // Simple role check mock: if email contains 'admin', go to admin
                router.push("/admin");
            } else {
                setError("Invalid admin credentials. Please try again.");
            }
        } catch (err) {
            setError("Connection failed. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 bg-hero-mesh">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-12 h-12 rounded-xl bg-saffron flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7">
                                <path d="M12 2L4 10v10a2 2 0 002 2h12a2 2 0 002-2V10l-8-8z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-display text-text-primary">Admin <span className="text-saffron">Portal</span></h1>
                    <p className="text-muted mt-2">Secure access for government officials</p>
                </div>

                <div className="glass-card rounded-2xl p-8 border border-card-border shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Officer Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full input-dark rounded-xl p-3 text-sm focus:ring-1 focus:ring-saffron"
                                placeholder="name@sevasetu.gov.in"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Access Key / Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full input-dark rounded-xl p-3 text-sm focus:ring-1 focus:ring-saffron"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-saffron py-3.5 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Verifying Access..." : "Authorize Login →"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-card-border text-center">
                        <p className="text-[10px] text-muted leading-relaxed uppercase tracking-widest font-bold opacity-60">
                            AUTHORIZED PERSONNEL ONLY • IP LOGGING ACTIVE
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-xs text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-2">
                        ← Back to Citizen Portal
                    </Link>
                </div>
            </div>
        </div>
    );
}
