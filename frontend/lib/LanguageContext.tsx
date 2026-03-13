"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SupportedLanguage = 
  | "en" | "hi" | "mr" | "te" | "ta" | "bn" | "gu" | "ur" | "kn" | "or" 
  | "ml" | "pa" | "as" | "ma" | "sd" | "sa" | "ks" | "ne" | "ko" | "do" 
  | "bo";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ma", label: "Maithili", native: "मैथिली" },
  { code: "sd", label: "Sindhi", native: "سنڌي" },
  { code: "sa", label: "Sanskrit", native: "संस्कृतम्" },
  { code: "ks", label: "Kashmiri", native: "کٲشُر" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "ko", label: "Konkani", native: "कोंकणी" },
  { code: "do", label: "Dogri", native: "डोगरी" },
  { code: "bo", label: "Bodo", native: "बड़ो" }
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const saved = localStorage.getItem("savasetu_lang") as SupportedLanguage;
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("savasetu_lang", lang);
    // In a real app, this might trigger a global re-fetch or translation API call
  };

  // Real translation dictionary for demo
  const translations: Record<string, Record<string, string>> = {
    hi: {
      "Home": "मुख्य पृष्ठ",
      "Schemes": "योजनाएं",
      "Eligibility": "पात्रता",
      "AI Chat": "एआई चैट",
      "Dashboard": "डैशबोर्ड",
      "Grievance": "शिकायत",
      "My Account": "मेरा खाता",
      "Welcome Back": "स्वागत है",
      "Log in using your Aadhaar Number": "अपने आधार नंबर का उपयोग करके लॉगिन करें",
      "Aadhaar Number": "आधार नंबर",
      "Get OTP": "ओटीपी प्राप्त करें",
      "Enter OTP": "ओटीपी दर्ज करें",
      "Log In securely": "सुरक्षित रूप से लॉगिन करें",
      "Verify your identity": "अपनी पहचान सत्यापित करें",
      "Need an account?": "खाता चाहिए?",
      "Register with Aadhaar": "आधार के साथ पंजीकरण करें",
      "Sava": "सेवा",
      "setu": "सेतु",
      "Eligible Schemes": "पात्र योजनाएं",
      "Applications Submitted": "जमा किए गए आवेदन",
      "Under Review": "समीक्षा के अधीन",
      "Approved": "अनुमोदित",
      "Active Applications": "सक्रिय आवेदन",
      "Quick Actions": "त्वरित कार्रवाई",
      "Notifications": "सूचनाएं",
      "Recommended for You": "आपके लिए अनुशंसित",
      "Track Application": "आवेदन ट्रैक करें",
      "File Grievance": "शिकायत दर्ज करें",
      "My Documents": "मेरे दस्तावेज़",
      "Apply for Scheme": "योजना के लिए आवेदन करें",
      "Namaste": "नमस्ते"
    },
    te: {
      "Home": "హోమ్",
      "Schemes": "పథకాలు",
      "Dashboard": "డాష్‌బోర్డ్",
      "Namaste": "నమస్తే"
    },
    mr: {
      "Home": "मुख्य पृष्ठ",
      "Schemes": "योजना",
      "Dashboard": "डॅशबोर्ड",
      "Namaste": "नमस्कार"
    },
    ta: {
      "Home": "முகப்பு",
      "Schemes": "திட்டங்கள்",
      "Dashboard": "டாஷ்போர்டு",
      "Namaste": "வணக்கம்"
    },
    bn: {
      "Home": "হোম",
      "Schemes": "পরিকল্পনা",
      "Dashboard": "ড্যাশবোর্ড",
      "Namaste": "নমস্কার"
    },
    gu: {
      "Home": "હોમ",
      "Schemes": "યોજનાઓ",
      "Dashboard": "ડેશબોર્ડ",
      "Namaste": "નમસ્તે"
    },
    kn: {
      "Home": "ಮುಖಪುట",
      "Schemes": "ಯೋಜನೆಗಳು",
      "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್డ్",
      "Namaste": "ನಮಸ್ಕಾರ"
    },
    ml: {
      "Home": "ഹോം",
      "Schemes": "പദ്ധതികൾ",
      "Dashboard": "ഡാഷ്ബോർഡ്",
      "Namaste": "നമസ്കാരം"
    },
    ur: {
      "Home": "ہوم",
      "Schemes": "اسکیمیں",
      "Dashboard": "ڈیش بورڈ",
      "Namaste": "سلام"
    }
    // More can be added as needed
  };

  const translate = (text: string) => {
    if (language === "en") return text;
    return translations[language]?.[text] || text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
