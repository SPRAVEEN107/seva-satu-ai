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
      "Log in securely": "सुरक्षित रूप से लॉगिन करें",
      "Aadhaar Number": "आधार नंबर",
      "Get OTP": "ओटीपी प्राप्त करें",
      "Enter OTP": "ओटीपी दर्ज करें",
      "Log In securely": "सुरक्षित रूप से लॉगिन करें",
      "Verify your identity": "अपनी पहचान सत्यापित करें",
      "Need an account?": "खाता चाहिए?",
      "Register with Aadhaar": "आधार के साथ पंजीकरण करें",
      "Eligible Government Schemes": "पात्र सरकारी योजनाएं",
      "Total Applications Filed": "कुल भरे गए आवेदन",
      "Verification In Progress": "सत्यापन प्रगति पर है",
      "Approved Benefits": "अनुमोदित लाभ",
      "Active Applications": "सक्रिय आवेदन",
      "Quick Actions": "त्वरित कार्रवाई",
      "Notifications": "सूचनाएं",
      "Recommended for You": "आपके लिए अनुशंसित",
      "Track Application": "आवेदन ट्रैक करें",
      "File Grievance": "शिकायत दर्ज करें",
      "My Documents": "मेरे दस्तावेज़",
      "Apply for Scheme": "योजना के लिए आवेदन करें",
      "Namaste": "नमस्ते",
      "Listening...": "सुन रहा हूँ...",
      "Done": "पूरा हुआ",
      "Close": "बंद करें",
      "Grievance Portal": "शिकायत पोर्टल",
      "Portal": "पोर्टल",
      "AI-classified complaints routed to the correct department. Get resolution in": "एआई-वर्गीकृत शिकायतें सही विभाग को भेजी गईं। समाधान प्राप्त करें",
      "15–45 days": "15-45 दिनों में",
      "Speak": "बोलें",
      "Details": "विवरण",
      "Submitted": "जमा किया गया",
      "Tracking ID": "ट्रैकिंग आईडी",
      "Department": "विभाग",
      "Priority": "प्राथमिकता",
      "Est. Resolution": "अनुमानित समाधान",
      "days": "दिन"
    },
    te: {
      "Home": "హోమ్",
      "Schemes": "పథకాలు",
      "Eligibility": "అర్హత",
      "AI Chat": "AI చాట్",
      "Dashboard": "డాష్‌బోర్డ్",
      "Grievance": "ఫిర్యాదు",
      "My Account": "నా ఖాతా",
      "Welcome Back": "స్వాగతం",
      "Aadhaar Number": "आधार సంఖ్య",
      "Get OTP": "OTP పొందండి",
      "Enter OTP": "OTP నమోదు చేయండి",
      "Log In securely": "సురక్షితంగా లాగిన్ అవ్వండి",
      "Verify your identity": "మీ గుర్తింపును ధృవీకరించండి",
      "Need an account?": "ఖాతా కావాలా?",
      "Register with Aadhaar": "ఆధార్‌తో నమోదు చేసుకోండి",
      "Eligible Government Schemes": "అర్హత కలిగిన ప్రభుత్వ పథకాలు",
      "Total Applications Filed": "మొత్తం దరఖాస్తులు",
      "Verification In Progress": "ధృవీకరణ పురోగతిలో ఉంది",
      "Approved Benefits": "ఆమోదించబడిన ప్రయోజనాలు",
      "Active Applications": "క్రియాశీల దరఖాస్తులు",
      "Quick Actions": "త్వరిత చర్యలు",
      "Notifications": "నోటిఫికేషన్లు",
      "Recommended for You": "మీ కోసం సిఫార్సు చేయబడింది",
      "Track Application": "దరఖాస్తును ట్రాక్ చేయండి",
      "File Grievance": "ఫిర్యాదు చేయండి",
      "My Documents": "నా పత్రాలు",
      "Apply for Scheme": "పథకం కోసం దరఖాస్తు చేయండి",
      "Namaste": "నమస్కారం",
      "Listening...": "వింటున్నాను...",
      "Done": "పూర్తయింది",
      "Close": "మూసివేయి",
      "Grievance Portal": "ఫిర్యాదుల పోర్టల్",
      "Portal": "పోర్టల్",
      "AI-classified complaints routed to the correct department. Get resolution in": "AI-వర్గీకరించిన ఫిర్యాదులు సరైన విభాగానికి పంపబడ్డాయి. పరిష్కారం పొందండి",
      "15–45 days": "15-45 రోజులలో",
      "Speak": "మాట్లాడండి",
      "Details": "వివరాలు",
      "Submitted": "సమర్పించారు",
      "Tracking ID": "ట్రాకింగ్ ID",
      "Department": "విభాగం",
      "Priority": "ప్రాధాన్యత",
      "Est. Resolution": "అంచనా పరిష్కారం",
      "days": "రోజులు"
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
