"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SchemeCard from "@/components/SchemeCard";
import { schemesAPI, type Scheme } from "@/lib/api";
import { animateCards } from "@/lib/gsap";
import { useLanguage } from "@/lib/LanguageContext";

const CATEGORIES = ["All", "Agriculture", "Health", "Housing", "Education", "Women", "Business", "Employment"];
const INDIAN_STATES = ["All", "Uttar Pradesh", "Maharashtra", "Bihar", "West Bengal", "Madhya Pradesh", "Tamil Nadu", "Rajasthan", "Karnataka", "Andhra Pradesh", "Odisha", "Telangana", "Gujarat", "Kerala", "Jharkhand", "Assam", "Punjab", "Chhattisgarh", "Haryana", "Delhi"];

export default function SchemesPage() {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    
    const { translate } = useLanguage();

    // Filters
    const [state, setState] = useState("");
    const [category, setCategory] = useState("");
    const [incomeRange, setIncomeRange] = useState("");

    const fetchSchemes = async (newPage = 1) => {
        setLoading(true);
        try {
            const res = await schemesAPI.list({
                state: state || undefined,
                category: category === "All" ? undefined : category || undefined,
                income_range: incomeRange || undefined,
                page: newPage,
                limit: 12,
            });
            setSchemes(res.data.schemes);
            setTotal(res.data.total);
            setPage(newPage);
            setTimeout(() => animateCards(".scheme-grid .scheme-card"), 100);
        } catch {
            setSchemes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchemes();
    }, []);

    return (
        <>
            <Navbar />
            <main className="min-h-screen mesh-bg pt-16">
                {/* Header */}
                <section className="py-12 px-4 text-center border-b border-card-border">
                    <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
                        {translate("Find Your")} <span className="saffron-text">{translate("Government Schemes")}</span>
                    </h1>
                    <p className="text-muted text-sm">
                        {translate(`Browse ${total || "1000+"} schemes across agriculture, health, housing, education and more`)}
                    </p>
                </section>

                {/* Sticky filters */}
                <div className="sticky top-16 z-30 bg-card-bg border-b border-card-border py-4 px-4">
                    <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="input-dark px-3 py-2 rounded-lg border border-card-border text-sm bg-card-bg"
                        >
                            {INDIAN_STATES.map((s) => (
                                <option key={s} value={s === "All" ? "" : s}>{s}</option>
                            ))}
                        </select>

                        <div className="flex gap-2 flex-wrap">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat === "All" ? "" : cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${(cat === "All" && !category) || category === cat
                                            ? "bg-saffron border-saffron text-white"
                                            : "border-card-border text-muted hover:border-saffron/40 hover:text-text-primary"
                                        }`}
                                >
                                    {translate(cat)}
                                </button>
                            ))}
                        </div>

                        <select
                            value={incomeRange}
                            onChange={(e) => setIncomeRange(e.target.value)}
                            className="input-dark px-3 py-2 rounded-lg border border-card-border text-sm bg-card-bg"
                        >
                            <option value="">{translate("Any Income")}</option>
                            <option value="low">{translate("Below ₹1 Lakh")}</option>
                            <option value="lower_mid">{translate("₹1–3 Lakh")}</option>
                            <option value="mid">{translate("₹3–6 Lakh")}</option>
                            <option value="upper_mid">{translate("₹6 Lakh+")}</option>
                        </select>

                        <button
                            onClick={() => fetchSchemes(1)}
                            className="btn-saffron px-5 py-2 rounded-lg text-sm font-medium ml-auto"
                        >
                            {translate("Apply Filters")}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <section className="max-w-7xl mx-auto px-4 py-8">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
                                    <div className="skeleton h-10 w-10 rounded-xl" />
                                    <div className="skeleton h-4 w-3/4 rounded" />
                                    <div className="skeleton h-3 w-1/2 rounded" />
                                    <div className="skeleton h-6 w-1/3 rounded" />
                                    <div className="skeleton h-3 w-full rounded" />
                                    <div className="skeleton h-3 w-4/5 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : schemes.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="font-display text-xl text-text-primary mb-2">{translate("No schemes found")}</h3>
                            <p className="text-muted text-sm">{translate("Try adjusting your filters")}</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted text-sm mb-6">
                                {translate(`Showing ${schemes.length} of ${total} schemes`)}
                            </p>
                            <div className="scheme-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {schemes.map((scheme) => (
                                    <SchemeCard key={scheme.id} scheme={scheme} matchScore={80} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {total > 12 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => fetchSchemes(page - 1)}
                                        disabled={page === 1}
                                        className="btn-outline px-4 py-2 rounded-lg text-sm disabled:opacity-40"
                                    >
                                        ← Prev
                                    </button>
                                    <span className="px-4 py-2 text-sm text-muted">
                                        Page {page} of {Math.ceil(total / 12)}
                                    </span>
                                    <button
                                        onClick={() => fetchSchemes(page + 1)}
                                        disabled={page >= Math.ceil(total / 12)}
                                        className="btn-saffron px-4 py-2 rounded-lg text-sm disabled:opacity-40"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </>
    );
}
