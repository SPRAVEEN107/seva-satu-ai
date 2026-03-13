"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/lib/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { translate } = useLanguage();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length !== 10) {
      setError(translate("Phone Number must be exactly 10 digits."));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires_registration) {
             setError(translate("Account not found. Please register first."));
             setLoading(false);
             return;
        }
        
        // Auto-fill OTP simulation for better UX
        if (data.simulated_otp) {
            setOtp(data.simulated_otp);
        }
        setStep(2);
      } else {
        setError(data.detail || translate("Failed to generate OTP"));
      }
    } catch (err) {
      console.warn("Backend unavailable, using mock OTP for demo");
      // MOCK FALLBACK FOR DEMO
      setOtp("123456");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        authClient.setToken(data.access_token);
        router.push("/dashboard");
      } else {
        setError(data.detail || translate("Invalid OTP"));
      }
    } catch (err) {
      console.warn("Backend unavailable, using mock login for demo");
      // MOCK LOGIN FOR DEMO
      authClient.setToken("mock_token_for_demo");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 relative overflow-hidden">
      
      {/* Background Decor - Extremely subtle */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-saffron via-white to-green opacity-30" />

      <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl p-8 z-10 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white">
            {translate("Welcome Back")}
          </h1>
          <p className="text-muted mt-2 text-sm">
            {step === 1 ? translate("Log in using your Phone Number") : translate("Verify your identity")}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-6 text-sm border border-red-500/20 text-center font-medium">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleGenerateOTP} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-muted mb-2">
                {translate("Phone Number")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono">+91</span>
                <input
                  type="text"
                  required
                  maxLength={10}
                  className="w-full pl-14 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white tracking-[0.2em] font-mono text-xl focus:border-saffron/50 transition-colors"
                  placeholder="XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-saffron hover:bg-saffron/90 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? translate("Verifying...") : translate("Authorize securely")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center mb-6">
              <div>
                <p className="text-xs text-muted mb-1">{translate("Phone Number")}</p>
                <p className="font-mono text-sm">+91 {phone}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-xs text-saffron hover:underline"
              >
                {translate("Change")}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 flex justify-between">
                <span>{translate("Enter OTP")}</span>
                <span className="text-xs text-green font-medium animate-pulse">
                  {translate("Auto-detected securely")}
                </span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl input-dark text-center tracking-[0.5em] text-2xl font-mono text-saffron"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full btn-saffron text-white font-bold py-3.5 rounded-xl disabled:opacity-50"
            >
              {loading ? translate("Verifying...") : translate("Log In securely")}
            </button>
          </form>
        )}

        <p className="text-center text-muted mt-8 text-sm">
          {translate("Need an account?")}{" "}
          <Link href="/signup" className="text-saffron font-semibold hover:underline">
            {translate("Register with Phone")}
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <Link href="/admin/login" className="text-[10px] text-muted/50 hover:text-saffron transition-colors uppercase tracking-widest font-bold">
            {translate("Officer? Admin Login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
