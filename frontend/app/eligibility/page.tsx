"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import SchemeCard from "@/components/SchemeCard";
import { eligibilityAPI, type SuggestedScheme, type EligibilityRequest } from "@/lib/api";
import { animateStepper, animateCards, animateCounter, gsap } from "@/lib/gsap";
import { useEffect } from "react";

const STEPS = ["Personal", "Economic", "Social", "Results"];
const OCCUPATIONS = ["farmer", "business", "self_employed", "daily_wage", "student", "government_employee", "domestic_worker", "artisan", "unemployed"];
const CASTES = ["General", "OBC", "SC", "ST", "EWS"];
const INDIAN_STATES = ["Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Gujarat", "Haryana", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Other"];

const INIT: EligibilityRequest = {
    name: "",
    age: undefined,
    gender: "",
    state: "",
    district: "",
    annual_income: undefined,
    occupation: "",
    land_ownership: false,
    caste_category: "",
    family_size: undefined,
};

export default function EligibilityPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<EligibilityRequest>(INIT);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SuggestedScheme[] | null>(null);
    const [totalMatched, setTotalMatched] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);
    const stepRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        animateStepper(step);
    }, [step]);

    const set = (k: keyof EligibilityRequest, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

    const goTo = (next: number) => {
        if (!stepRef.current) { setStep(next); return; }
        const dir = next > step ? -30 : 30;
        gsap.to(stepRef.current, {
            x: dir, opacity: 0, duration: 0.2, ease: "power2.in",
            onComplete: () => {
                setStep(next);
                gsap.fromTo(stepRef.current!, { x: -dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
            },
        });
    };

    const handleCheck = async () => {
        setLoading(true);
        try {
            const res = await eligibilityAPI.check(form);
            setResults(res.data.eligible_schemes);
            setTotalMatched(res.data.total_matched);
            goTo(3);
            setTimeout(() => {
                if (countRef.current) animateCounter(countRef.current, res.data.total_matched);
                animateCards(".eligibility-results .scheme-card");
            }, 400);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "input-dark w-full px-4 py-2.5 rounded-xl border border-card-border text-sm";
    const labelClass = "block text-sm text-muted mb-1.5";

    return (
        <>
            <Navbar />
            <main className="min-h-screen mesh-bg pt-16">
                <section className="py-12 px-4 text-center border-b border-card-border">
                    <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
                        Check Your <span className="saffron-text">Eligibility</span>
                    </h1>
                    <p className="text-muted text-sm">Answer 4 sets of questions — AI finds your best matches</p>
                </section>

                <div className="max-w-xl mx-auto px-4 py-10">
                    {/* Stepper */}
                    <div className="flex items-center mb-10 relative">
                        <div className="absolute top-5 left-5 right-5 h-0.5 bg-card-border" />
                        <div
                            id="stepper-bar"
                            className="absolute top-5 left-5 h-0.5 bg-saffron transition-all duration-500"
                            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                        />
                        {STEPS.map((label, i) => (
                            <div key={label} className="flex-1 flex flex-col items-center z-10">
                                <div className={`stepper-step w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${i < step ? "bg-india-green border-india-green text-white" : i === step ? "bg-saffron border-saffron text-white scale-110" : "bg-card-bg border-card-border text-muted"}`}>
                                    {i < step ? "✓" : i + 1}
                                </div>
                                <span className={`text-xs mt-2 ${i === step ? "text-saffron font-medium" : "text-muted"}`}>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div ref={stepRef}>
                        {/* STEP 0: Personal */}
                        {step === 0 && (
                            <div className="glass-card rounded-2xl p-6 space-y-4">
                                <h2 className="font-display text-xl text-text-primary">Personal Information</h2>
                                <div><label className={labelClass}>Your Name</label>
                                    <input className={inputClass} placeholder="Full name" value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Age</label>
                                        <input type="number" className={inputClass} placeholder="Your age" value={form.age || ""} onChange={(e) => set("age", +e.target.value)} /></div>
                                    <div><label className={labelClass}>Gender</label>
                                        <select className={inputClass + " bg-card-bg"} value={form.gender || ""} onChange={(e) => set("gender", e.target.value)}>
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select></div>
                                </div>
                                <div><label className={labelClass}>State</label>
                                    <select className={inputClass + " bg-card-bg"} value={form.state || ""} onChange={(e) => set("state", e.target.value)}>
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                                    </select></div>
                                <div><label className={labelClass}>District</label>
                                    <input className={inputClass} placeholder="Your district" value={form.district || ""} onChange={(e) => set("district", e.target.value)} /></div>
                                <button onClick={() => goTo(1)} className="btn-saffron w-full py-3 rounded-xl text-sm font-semibold mt-2">Continue →</button>
                            </div>
                        )}

                        {/* STEP 1: Economic */}
                        {step === 1 && (
                            <div className="glass-card rounded-2xl p-6 space-y-4">
                                <h2 className="font-display text-xl text-text-primary">Economic Information</h2>
                                <div><label className={labelClass}>Annual Income (₹)</label>
                                    <input type="number" className={inputClass} placeholder="e.g., 120000" value={form.annual_income || ""} onChange={(e) => set("annual_income", +e.target.value)} /></div>
                                <div><label className={labelClass}>Occupation</label>
                                    <select className={inputClass + " bg-card-bg"} value={form.occupation || ""} onChange={(e) => set("occupation", e.target.value)}>
                                        <option value="">Select</option>
                                        {OCCUPATIONS.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
                                    </select></div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="land" checked={form.land_ownership || false} onChange={(e) => set("land_ownership", e.target.checked)} className="w-4 h-4 accent-saffron" />
                                    <label htmlFor="land" className="text-sm text-text-primary">I own agricultural land</label>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => goTo(0)} className="btn-outline flex-1 py-3 rounded-xl text-sm">← Back</button>
                                    <button onClick={() => goTo(2)} className="btn-saffron flex-1 py-3 rounded-xl text-sm font-semibold">Continue →</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Social */}
                        {step === 2 && (
                            <div className="glass-card rounded-2xl p-6 space-y-4">
                                <h2 className="font-display text-xl text-text-primary">Social Information</h2>
                                <div><label className={labelClass}>Caste Category</label>
                                    <select className={inputClass + " bg-card-bg"} value={form.caste_category || ""} onChange={(e) => set("caste_category", e.target.value)}>
                                        <option value="">Select</option>
                                        {CASTES.map((c) => <option key={c}>{c}</option>)}
                                    </select></div>
                                <div><label className={labelClass}>Family Size</label>
                                    <input type="number" className={inputClass} placeholder="Number of family members" value={form.family_size || ""} onChange={(e) => set("family_size", +e.target.value)} /></div>
                                <div className="flex gap-3">
                                    <button onClick={() => goTo(1)} className="btn-outline flex-1 py-3 rounded-xl text-sm">← Back</button>
                                    <button onClick={handleCheck} disabled={loading} className="btn-saffron flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50">
                                        {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking...</span> : "Check Eligibility ✨"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Results */}
                        {step === 3 && results !== null && (
                            <div className="eligibility-results">
                                <div className="text-center mb-8">
                                    <div className="text-5xl font-display font-bold text-saffron flex items-center justify-center gap-2">
                                        <span ref={countRef}>0</span>
                                    </div>
                                    <h2 className="font-display text-xl text-text-primary mt-1">Eligible Schemes Found!</h2>
                                    <p className="text-muted text-sm mt-1">Based on your profile — {form.name || "Citizen"} from {form.state}</p>
                                </div>
                                {results.length === 0 ? (
                                    <div className="text-center text-muted py-8">No schemes matched your profile. Try adjusting your information.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {results.map((s, i) => (
                                            <SchemeCard key={i} scheme={s} matchScore={s.match_score} />
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => { setStep(0); setResults(null); setForm(INIT); }} className="btn-outline w-full py-3 rounded-xl text-sm mt-6">
                                    Check Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
