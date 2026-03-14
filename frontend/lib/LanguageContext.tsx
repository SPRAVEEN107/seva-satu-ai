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
  { code: "ml", label: "Malayalam", native: "മലയാളం" },
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
  };

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
      "Speak name": "नाम बोलें",
      "Speak phone": "फ़ोन बोलें",
      "Speak state": "राज्य बोलें",
      "Speak district": "जिला बोलें",
      "Dictate your issue": "अपनी समस्या बताएं",
      "Your Name": "आपका नाम",
      "Your full name": "आपका पूरा नाम",
      "Phone Number": "फ़ोन नंबर",
      "State": "राज्य",
      "District": "जिला",
      "Your district": "आपका जिला",
      "Describe your issue": "अपनी समस्या का वर्णन करें",
      "Describe your grievance in detail. Be as specific as possible...": "अपनी शिकायत का विस्तार से वर्णन करें। जितना हो सके उतना विशिष्ट रहें...",
      "Submit Grievance ✓": "शिकायत जमा करें ✓",
      "Submitting...": "जमा कर रहे हैं...",
      "Back": "पीछे",
      "Continue →": "जारी रखें →",
      "What is your issue about?": "आपकी समस्या किस बारे में है?",
      "Select the category that best describes your grievance": "वह श्रेणी चुनें जो आपकी शिकायत का सबसे अच्छा वर्णन करती है",
      "Category": "श्रेणी",
      "Details": "विवरण",
      "Submitted": "जमा किया गया",
      "Grievance Submitted!": "शिकायत जमा की गई!",
      "Tracking ID": "ट्रैकिंग आईडी",
      "Department": "विभाग",
      "Priority": "प्राथमिकता",
      "Est. Resolution": "अनुमानित समाधान",
      "days": "दिन",
      "Download Report": "रिपोर्ट डाउनलोड करें",
      "Downloaded!": "डाउनलोड किया गया!",
      "File Another Grievance": "एक और शिकायत दर्ज करें",
      "Track Existing Complaint": "मौजूदा शिकायत ट्रैक करें",
      "Enter tracking ID (e.g., GRV-20250310-ABCD)": "ट्रैकिंग आईडी दर्ज करें (जैसे, GRV-20250310-ABCD)",
      "Track →": "ट्रैक →",
      "Status": "स्थिति",
      "Government Schemes": "सरकारी योजनाएं",
      "All Central & State Government Schemes in one place. Select your home state to see applicable schemes.": "सभी केंद्र और राज्य सरकार की योजनाएं एक ही स्थान पर। लागू योजनाओं को देखने के लिए अपने गृह राज्य का चयन करें।",
      "Central Govt": "केंद्र सरकार",
      "State Schemes": "राज्य की योजनाएं",
      "PM Schemes": "पीएम योजनाएं",
      "BPL Schemes": "बीपीएल योजनाएं",
      "Women Schemes": "महिला योजनाएं",
      "Agriculture": "कृषि",
      "Health": "स्वास्थ्य",
      "Housing": "आवास",
      "Education": "शिक्षा",
      "Business": "व्यवसाय",
      "Employment": "रोजगार",
      "Apply Now": "अभी आवेदन करें",
      "Any Income": "कोई भी आय",
      "Below ₹1 Lakh": "₹1 लाख से नीचे",
      "₹1–3 Lakh": "₹1–3 लाख",
      "₹3–6 Lakh": "₹3–6 लाख",
      "₹6 Lakh+": "₹6 लाख+",
      "Apply Filters": "फ़िल्टर लागू करें",
      "No schemes found": "कोई योजना नहीं मिली",
      "Try adjusting your filters": "अपने फ़िल्टर समायोजित करने का प्रयास करें",
      "National Single Window Portal": "राष्ट्रीय एकल खिड़की पोर्टल",
      "Select Your Language": "अपनी भाषा चुनें",
      "Hey SevaSetu AI": "हे सेवासेतु एआई",
      "Sign Language (ISL)": "सांकेतिक भाषा (ISL)",
      "Accessibility Tools": "अभिगम्यता उपकरण",
      "All 28 States + 8 UTs": "सभी 28 राज्य + 8 केंद्र शासित प्रदेश",
      "Women & BPL Schemes": "महिला और बीपीएल योजनाएं",
      "PM Schemes": "पीएम योजनाएं",
      "System Admin Login": "सिस्टम एडमिन लॉगिन",
      "Officer? Admin Login": "अधिकारी? एडमिन लॉगिन",
      "Register with Phone": "फ़ोन के साथ पंजीकरण करें",
      "Log in using your Phone Number": "अपने फ़ोन नंबर का उपयोग करके लॉगिन करें",
      "Authorize securely": "सुरक्षित रूप से अधिकृत करें",
      "Auto-detected securely": "सुरक्षित रूप से ऑटो-डिटेक्ट किया गया",
      "Verifying...": "सत्यापित कर रहे हैं..."
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
      "Aadhaar Number": "ఆధార్ సంఖ్య",
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
      "Speak name": "పేరు మాట్లాడండి",
      "Speak phone": "ఫోన్ మాట్లాడండి",
      "Speak state": "రాష్ట్రం మాట్లాడండి",
      "Speak district": "జిల్లా మాట్లాడండి",
      "Dictate your issue": "మీ సమస్యను చెప్పండి",
      "Your Name": "మీ పేరు",
      "Your full name": "మీ పూర్తి పేరు",
      "Phone Number": "ఫోన్ నంబర్",
      "State": "రాష్ట్రం",
      "District": "జిల్లా",
      "Your district": "మీ జిల్లా",
      "Describe your issue": "మీ సమస్యను వివరించండి",
      "Describe your grievance in detail. Be as specific as possible...": "మీ సమస్యను వివరంగా వివరించండి. సాధ్యమైనంత స్పష్టంగా ఉండండి...",
      "Submit Grievance ✓": "ఫిర్యాదును సమర్పించండి ✓",
      "Submitting...": "సమర్పిస్తున్నాము...",
      "Back": "వెనుకకు",
      "Continue →": "కొనసాగించు →",
      "What is your issue about?": "మీ సమస్య దేని గురించి?",
      "Select the category that best describes your grievance": "మీ ఫిర్యాదును ఉత్తమంగా వివరించే వర్గాన్ని ఎంచుకోండి",
      "Category": "వర్గం",
      "Details": "వివరాలు",
      "Submitted": "సమర్పించారు",
      "Grievance Submitted!": "ఫిర్యాదు సమర్పించబడింది!",
      "Tracking ID": "ట్రాకింగ్ ID",
      "Department": "విభాగం",
      "Priority": "ప్రాధాన్యత",
      "Est. Resolution": "అంచనా పరిష్కారం",
      "days": "రోజులు",
      "Download Report": "నివేదికను డౌన్‌లోడ్ చేయండి",
      "Downloaded!": "డౌన్‌లోడ్ చేయబడింది!",
      "File Another Grievance": "మరో ఫిర్యాదును సమర్పించండి",
      "Track Existing Complaint": "ఫిర్యాదును ట్రాక్ చేయండి",
      "Enter tracking ID (e.g., GRV-20250310-ABCD)": "ట్రాకింగ్ IDని నమోదు చేయండి (ఉదా, GRV-20250310-ABCD)",
      "Track →": "ట్రాక్ →",
      "Status": "స్థితి",
      "Government Schemes": "ప్రభుత్వ పథకాలు",
      "All Central & State Government Schemes in one place. Select your home state to see applicable schemes.": "అన్ని కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ పథకాలు ఒకే చోట. వర్తించే పథకాలను చూడటానికి మీ స్వంత రాష్ట్రాన్ని ఎంచుకోండి.",
      "Central Govt": "కేంద్ర ప్రభుత్వం",
      "State Schemes": "రాష్ట్ర పథకాలు",
      "PM Schemes": "PM పథకాలు",
      "BPL Schemes": "BPL పథకాలు",
      "Women Schemes": "మహిళల పథకాలు",
      "Agriculture": "వ్యవసాయం",
      "Health": "ఆరోగ్యం",
      "Housing": "గృహనిర్మాణం",
      "Education": "విద్య",
      "Business": "వ్యాపారం",
      "Employment": "ఉపాధి",
      "Apply Now": "ఇప్పుడే దరఖాస్తు చేయండి",
      "Any Income": "ఏదైనా ఆదాయం",
      "Below ₹1 Lakh": "₹1 లక్ష కంటే తక్కువ",
      "₹1–3 Lakh": "₹1–3 లక్షలు",
      "₹3–6 Lakh": "₹3–6 లక్షలు",
      "₹6 Lakh+": "₹6 లక్షలు పైన",
      "Apply Filters": "ఫిల్టర్‌లను వర్తింపజేయండి",
      "No schemes found": "ఎటువంటి పథకాలు కనుగొనబడలేదు",
      "Try adjusting your filters": "మీ ఫిల్టర్‌లను సర్దుబాటు చేయడానికి ప్రయత్నించండి",
      "National Single Window Portal": "నేషనల్ సింగిల్ విండో పోర్టల్",
      "Select Your Language": "మీ భాషను ఎంచుకోండి",
      "Hey SevaSetu AI": "హే సేవాసేతు AI",
      "Sign Language (ISL)": "సైన్ లాంగ్వేజ్ (ISL)",
      "Accessibility Tools": "యాక్సెసిబిలిటీ టూల్స్",
      "All 28 States + 8 UTs": "అన్ని 28 రాష్ట్రాలు + 8 UTలు",
      "Women & BPL Schemes": "మహిళలు & BPL పథకాలు",
      "PM Schemes": "PM పథకాలు",
      "System Admin Login": "సిస్టమ్ అడ్మిన్ లాగిన్",
      "Officer? Admin Login": "ఆఫీసర్? అడ్మిన్ లాగిన్",
      "Register with Phone": "ఫోన్ నంబర్ తో నమోదు చేసుకోండి",
      "Log in using your Phone Number": "మీ ఫోన్ నంబర్ ఉపయోగించి లాగిన్ చేయండి",
      "Authorize securely": "సురక్షితంగా లాగిన్ అవ్వండి",
      "Auto-detected securely": "ఆటోమేటిక్ గా గుర్తించబడింది",
      "Verifying...": "ధృవీకరిస్తున్నాము..."
    },
    mr: {
      "Home": "मुख्य पृष्ठ",
      "Schemes": "योजना",
      "Dashboard": "डॅशबोर्ड",
      "Namaste": "नमस्कार",
      "Grievance": "तक्रार",
      "Eligibility": "पात्रता"
    },
    ta: {
      "Home": "முகப்பு",
      "Schemes": "திட்டங்கள்",
      "Dashboard": "டாஷ்போர்டு",
      "Namaste": "வணக்கம்",
      "Grievance": "புகார்",
      "Eligibility": "தகுதி"
    },
    bn: {
      "Home": "হোম",
      "Schemes": "পরিকল্পনা",
      "Dashboard": "ড্যাশবোর্ড",
      "Namaste": "নমস্কার",
      "Grievance": "অভিযোগ",
      "Eligibility": "যোগ্যতা"
    },
    gu: {
      "Home": "હોమ్",
      "Schemes": "યોજનાઓ",
      "Dashboard": "ડેશબોર્ડ",
      "Namaste": "नमस्ते",
      "Grievance": "ફરિયાદ",
      "Eligibility": "પાત્રता"
    },
    kn: {
      "Home": "ಮುಖಪುಟ",
      "Schemes": "ಯೋಜನೆಗಳು",
      "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      "Namaste": "ನಮಸ್ಕಾರ",
      "Grievance": "ದೂರು",
      "Eligibility": "ಅರ್ಹತೆ"
    },
    ml: {
      "Home": "ഹోమ్",
      "Schemes": "പദ്ധതികൾ",
      "Dashboard": "ഡാష్ബോർഡ്",
      "Namaste": "ನమസ്കാരം",
      "Grievance": "പരാതി",
      "Eligibility": "യോഗ്യത"
    },
    ur: {
      "Home": "ہوم",
      "Schemes": "اسکیمیں",
      "Dashboard": "ڈیش بورڈ",
      "Namaste": "سلام",
      "Grievance": "شکایت",
      "Eligibility": "اہلیت"
    }
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
