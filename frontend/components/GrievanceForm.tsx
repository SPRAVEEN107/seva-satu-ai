"use client";

import { useState, useRef } from "react";
import { grievanceAPI } from "@/lib/api";
import { animateStepper, animateSubmitSuccess } from "@/lib/gsap";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/LanguageContext";

const CATEGORIES = [
    { id: "Ration Card", icon: "🏪", color: "#FF6B00" },
    { id: "Pension", icon: "👴", color: "#0047AB" },
    { id: "MNREGA", icon: "👷", color: "#138808" },
    { id: "Housing", icon: "🏠", color: "#6F42C1" },
    { id: "Healthcare", icon: "🏥", color: "#DC3545" },
    { id: "Other", icon: "📋", color: "#8888AA" },
];

export default function GrievanceForm() {
    const [step, setStep] = useState(0);
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{
        tracking_id: string;
        department: string;
        priority: string;
        estimated_days: number;
        message: string;
    } | null>(null);
    const [trackId, setTrackId] = useState("");
    const [trackResult, setTrackResult] = useState<any>(null);
    const [trackLoading, setTrackLoading] = useState(false);
    const [isListeningDictation, setIsListeningDictation] = useState(false);
    
    const { translate, language } = useLanguage();

    const successRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    // Voice dictation logic
    const toggleDictation = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert(translate("Voice input is not supported in this browser."));
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Use the context language state to map to BCP 47 codes
        recognition.lang = language === 'en' ? 'en-IN' : `${language}-IN`;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
            setIsListeningDictation(true);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setDescription(prev => (prev + " " + finalTranscript).trim());
            }
        };

        recognition.onerror = (event: any) => {
            console.error(event.error);
            setIsListeningDictation(false);
        };

        recognition.onend = () => {
            setIsListeningDictation(false);
        };

        recognition.start();
    };

    const advanceTo = (nextStep: number) => {
        if (formRef.current) {
            gsap.to(formRef.current, {
                x: nextStep > step ? -20 : 20,
                opacity: 0,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    setStep(nextStep);
                    animateStepper(nextStep);
                    gsap.fromTo(
                        formRef.current,
                        { x: nextStep > step ? 20 : -20, opacity: 0 },
                        { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
                    );
                },
            });
        } else {
            setStep(nextStep);
            animateStepper(nextStep);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await grievanceAPI.submit({
                category,
                description,
                district,
                state,
            });
            setResult(res.data);
            setStep(2);
            animateStepper(2);

            // Confetti on success
            setTimeout(() => {
                if (successRef.current) animateSubmitSuccess(successRef.current);
            }, 300);
        } catch {
            alert("Failed to submit. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrack = async () => {
        if (!trackId.trim()) return;
        setTrackLoading(true);
        try {
            const res = await grievanceAPI.track(trackId.trim());
            setTrackResult(res.data);
        } catch {
            setTrackResult({ error: "Grievance not found. Please check your tracking ID." });
        } finally {
            setTrackLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* ─── Stepper ─────────────────────────────────────── */}
            <div className="mb-8">
                <div className="flex items-center gap-0 relative">
                    {/* Background bar */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-card-border" />
                    <div
                        id="stepper-bar"
                        className="absolute top-5 left-5 h-0.5 bg-saffron transition-all duration-500"
                        style={{ width: step === 0 ? "0%" : step === 1 ? "50%" : "100%" }}
                    />
                    {[translate("Category"), translate("Details"), translate("Submitted")].map((label, i) => (
                        <div key={label} className="flex-1 flex flex-col items-center z-10">
                            <div
                                className={`stepper-step w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${i < step
                                    ? "bg-india-green border-india-green text-white"
                                    : i === step
                                        ? "bg-saffron border-saffron text-white scale-110"
                                        : "bg-card-bg border-card-border text-muted"
                                    }`}
                            >
                                {i < step ? "✓" : i + 1}
                            </div>
                            <span className={`text-xs mt-2 ${i === step ? "text-saffron font-medium" : "text-muted"}`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div ref={formRef}>
                {/* ─── STEP 0: Category ─────────────────────────── */}
                {step === 0 && (
                    <div>
                        <h2 className="font-display text-2xl text-text-primary mb-2">{translate("What is your issue about?")}</h2>
                        <p className="text-muted text-sm mb-6">{translate("Select the category that best describes your grievance")}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 ${category === cat.id
                                        ? "scale-105"
                                        : "border-card-border hover:border-white/20"
                                        }`}
                                    style={
                                        category === cat.id
                                            ? { borderColor: cat.color, background: cat.color + "15" }
                                            : {}
                                    }
                                >
                                    <div className="text-3xl mb-2">{cat.icon}</div>
                                    <div className="text-sm font-medium text-text-primary">{translate(cat.id)}</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => advanceTo(1)}
                            disabled={!category}
                            className="btn-saffron mt-6 w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {translate("Continue →")}
                        </button>
                    </div>
                )}

                {/* ─── STEP 1: Details ──────────────────────────── */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="font-display text-2xl text-text-primary mb-2">{translate("Describe your issue")}</h2>
                        <p className="text-muted text-sm mb-6">{translate("Category:")} <span className="text-saffron">{translate(category)}</span></p>

                        <div>
                            <label className="block text-sm text-muted mb-1.5">State</label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="e.g., Uttar Pradesh"
                                className="input-dark w-full px-4 py-2.5 rounded-xl border border-card-border text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted mb-1.5">District</label>
                            <input
                                type="text"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                placeholder="Your district"
                                className="input-dark w-full px-4 py-2.5 rounded-xl border border-card-border text-sm"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm text-muted">
                                    {translate("Describe your issue")} <span className="text-saffron">*</span>
                                </label>
                                <button 
                                    onClick={toggleDictation}
                                    title={translate("Dictate your issue")}
                                    className={`text-xs p-1.5 rounded-md flex items-center gap-1 border transition-colors ${isListeningDictation 
                                        ? "border-red-500 text-red-500 bg-red-500/10 animate-pulse" 
                                        : "border-card-border text-muted hover:text-saffron hover:border-saffron"}`}
                                >
                                    🎤 {isListeningDictation ? translate("Listening...") : translate("Speak")}
                                </button>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                placeholder={translate("Describe your grievance in detail. Be as specific as possible...")}
                                className="input-dark w-full px-4 py-3 rounded-xl border border-card-border text-sm resize-none"
                            />
                            <div className="flex justify-end mt-1">
                                <span className={`text-xs ${description.length > 500 ? "text-saffron" : "text-muted"}`}>
                                    {description.length}/500
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => advanceTo(0)}
                                className="btn-outline flex-1 py-3 rounded-xl text-sm font-semibold"
                            >
                                ← {translate("Back")}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!description.trim() || isLoading}
                                className="btn-saffron flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {translate("Submitting...")}
                                    </span>
                                ) : (
                                    translate("Submit Grievance ✓")
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── STEP 2: Success ──────────────────────────── */}
                {step === 2 && result && (
                    <div className="text-center" ref={successRef} style={{ position: "relative" }}>
                        <div className="w-16 h-16 rounded-full bg-india-green/20 border border-india-green/40 flex items-center justify-center text-3xl mx-auto mb-4">
                            ✅
                        </div>
                        <h2 className="font-display text-2xl text-text-primary mb-2">{translate("Grievance Submitted!")}</h2>
                        <p className="text-muted text-sm mb-6">{result.message}</p>

                        <div className="glass-card rounded-2xl p-6 text-left mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-muted text-sm">{translate("Tracking ID")}</span>
                                <div className="flex items-center gap-2">
                                    <code className="text-saffron font-mono text-sm">{result.tracking_id}</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(result.tracking_id)}
                                        className="text-xs text-muted hover:text-saffron transition-colors"
                                    >
                                        📋 {translate("Copy")}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">{translate("Department")}</span>
                                    <span className="text-text-primary">{result.department}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">{translate("Priority")}</span>
                                    <span className={`capitalize ${result.priority === "high" ? "text-red-400" : "text-amber-400"}`}>
                                        {result.priority}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">{translate("Est. Resolution")}</span>
                                    <span className="text-text-primary">{result.estimated_days} {translate("days")}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => { setStep(0); setCategory(""); setDescription(""); setResult(null); }}
                            className="btn-outline px-6 py-2.5 rounded-xl text-sm font-medium"
                        >
                            {translate("File Another Grievance")}
                        </button>
                    </div>
                )}
            </div>

            {/* ─── Track Existing ─────────────────────────────── */}
            <div className="mt-12 pt-8 border-t border-card-border">
                <h3 className="font-display text-lg text-text-primary mb-4">Track Existing Complaint</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        placeholder="Enter tracking ID (e.g., GRV-20250310-ABCD)"
                        className="input-dark flex-1 px-4 py-2.5 rounded-xl border border-card-border text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                    />
                    <button
                        onClick={handleTrack}
                        disabled={trackLoading}
                        className="btn-cobalt px-5 py-2.5 rounded-xl text-sm font-medium"
                    >
                        {trackLoading ? "..." : "Track →"}
                    </button>
                </div>

                {trackResult && (
                    <div className="mt-4 glass-card rounded-xl p-4 text-sm">
                        {(trackResult as { error?: string }).error ? (
                            <p className="text-red-400">{(trackResult as { error: string }).error}</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted">Status</span>
                                    <span className={`status-${(trackResult as { status: string }).status} badge`}>
                                        {(trackResult as { status: string }).status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Department</span>
                                    <span className="text-text-primary">{(trackResult as { department: string }).department}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
