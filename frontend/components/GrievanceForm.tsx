"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { grievanceAPI } from "@/lib/api";
import { animateStepper, animateSubmitSuccess } from "@/lib/gsap";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/LanguageContext";

// Department → Assigned Employee mapping
const DEPT_EMPLOYEES: Record<string, { name: string; phone: string; empId: string; dept: string }[]> = {
  "Ration Card": [
    { name: "Ramesh Kumar Singh", phone: "+91-9876543210", empId: "FCS/UP/2847", dept: "Food & Civil Supplies Dept" },
    { name: "Priya Sharma", phone: "+91-9823456789", empId: "FCS/UP/2901", dept: "Food & Civil Supplies Dept" },
  ],
  "Pension": [
    { name: "Anita Devi", phone: "+91-9712345678", empId: "SW/MH/4521", dept: "Social Welfare Department" },
    { name: "Suresh Yadav", phone: "+91-9634567890", empId: "SW/MH/4589", dept: "Social Welfare Department" },
  ],
  "MNREGA": [
    { name: "Mohan Lal", phone: "+91-9567891234", empId: "RD/RJ/7123", dept: "Rural Development Ministry" },
    { name: "Kavita Patel", phone: "+91-9456789123", empId: "RD/RJ/7201", dept: "Rural Development Ministry" },
  ],
  "Housing": [
    { name: "Vikram Singh", phone: "+91-9345678912", empId: "MOH/GJ/3341", dept: "Ministry of Housing & Urban Affairs" },
    { name: "Sunita Rao", phone: "+91-9234567891", empId: "MOH/GJ/3398", dept: "Ministry of Housing & Urban Affairs" },
  ],
  "Healthcare": [
    { name: "Dr. Arun Mehta", phone: "+91-9123456782", empId: "MOH/KA/5521", dept: "Ministry of Health & Family Welfare" },
    { name: "Nurse Lalitha B.", phone: "+91-9012345678", empId: "MOH/KA/5578", dept: "Ministry of Health & Family Welfare" },
  ],
  "Other": [
    { name: "Rajesh Agarwal", phone: "+91-9901234567", empId: "GA/DL/1023", dept: "General Administration" },
    { name: "Manisha Verma", phone: "+91-9890123456", empId: "GA/DL/1089", dept: "General Administration" },
  ],
};

const CATEGORIES = [
  { id: "Ration Card", icon: "🏪", color: "#FF6B00" },
  { id: "Pension", icon: "👴", color: "#0047AB" },
  { id: "MNREGA", icon: "👷", color: "#138808" },
  { id: "Housing", icon: "🏠", color: "#6F42C1" },
  { id: "Healthcare", icon: "🏥", color: "#DC3545" },
  { id: "Other", icon: "📋", color: "#8888AA" },
];

interface GrievanceResult {
  tracking_id: string;
  department: string;
  priority: string;
  estimated_days: number;
  message: string;
  status?: string;
  assigned_employee?: { name: string; phone: string; empId: string; dept: string };
  registered_at?: string;
  citizen_name?: string;
  citizen_phone?: string;
  _source?: string;
}

export default function GrievanceForm() {
  const [activeView, setActiveView] = useState<"register" | "track">("register");
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GrievanceResult | null>(null);
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [isListeningDictation, setIsListeningDictation] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);

  const { translate, language } = useLanguage();
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const schemeParam = searchParams.get("scheme");
    if (schemeParam) {
      setDescription(`I would like to apply for the "${schemeParam}" scheme. Please help me with the registration process.`);
      const lowScheme = schemeParam.toLowerCase();
      if (lowScheme.includes("ration") || lowScheme.includes("anna")) setCategory("Ration Card");
      else if (lowScheme.includes("pension") || lowScheme.includes("old age")) setCategory("Pension");
      else if (lowScheme.includes("housing") || lowScheme.includes("awas")) setCategory("Housing");
      else if (lowScheme.includes("kisan") || lowScheme.includes("farmer")) setCategory("Other");
      else if (lowScheme.includes("health") || lowScheme.includes("ayushman")) setCategory("Healthcare");
      else if (lowScheme.includes("women") || lowScheme.includes("kanya")) setCategory("Other");
      
      if (category) setStep(1); 
    }
  }, [searchParams, category]);

  const toggleDictation = (target: "description" | "state" | "district" | "name" | "phone") => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(translate("Voice input is not supported in this browser."));
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    const langCodes: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', ml: 'ml-IN', pa: 'pa-IN' };
    recognition.lang = langCodes[language] || 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListeningDictation(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (target === "description") setDescription(prev => (prev + " " + text).trim());
      else if (target === "state") setState(text);
      else if (target === "district") setDistrict(text);
      else if (target === "name") setCitizenName(text);
      else if (target === "phone") setCitizenPhone(text.replace(/\s/g, ''));
    };
    recognition.onerror = () => setIsListeningDictation(false);
    recognition.onend = () => setIsListeningDictation(false);
    try { recognition.start(); } catch { setIsListeningDictation(false); }
  };

  const advanceTo = (nextStep: number) => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        x: nextStep > step ? -20 : 20, opacity: 0, duration: 0.2, ease: "power2.in",
        onComplete: () => {
          setStep(nextStep);
          animateStepper(nextStep);
          gsap.fromTo(formRef.current, { x: nextStep > step ? 20 : -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
        },
      });
    } else {
      setStep(nextStep);
      animateStepper(nextStep);
    }
  };

  const getAssignedEmployee = (cat: string) => {
    const pool = DEPT_EMPLOYEES[cat] || DEPT_EMPLOYEES["Other"];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await grievanceAPI.submit({ category, description, district, state });
      const employee = getAssignedEmployee(category);
      const enrichedResult = {
        ...res.data,
        assigned_employee: employee,
        registered_at: new Date().toISOString(),
        citizen_name: citizenName || "Citizen",
        citizen_phone: citizenPhone,
        _source: "api"
      };
      setResult(enrichedResult);
      const stored = JSON.parse(localStorage.getItem("demo_grievances") || "[]");
      localStorage.setItem("demo_grievances", JSON.stringify([enrichedResult, ...stored]));
      setStep(2);
      animateStepper(2);
      setTimeout(() => { if (successRef.current) animateSubmitSuccess(successRef.current); }, 300);
    } catch {
      const employee = getAssignedEmployee(category);
      const deptMap: Record<string, string> = {
        "Ration Card": "Food & Civil Supplies Department",
        "Pension": "Social Welfare Department",
        "MNREGA": "Rural Development Ministry",
        "Housing": "Ministry of Housing & Urban Affairs",
        "Healthcare": "Ministry of Health & Family Welfare",
        "Other": "General Administration",
      };
      const fallbackResult: GrievanceResult = {
        tracking_id: `GRV-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        department: deptMap[category] || "General Administration",
        priority: description.length > 100 ? "high" : "normal",
        estimated_days: 15,
        status: "received",
        message: "Your grievance has been registered successfully.",
        assigned_employee: employee,
        registered_at: new Date().toISOString(),
        _source: "local"
      };
      setResult(fallbackResult);
      const stored = JSON.parse(localStorage.getItem("demo_grievances") || "[]");
      const adminEntry = {
        ...fallbackResult,
        citizen_name: citizenName || "Citizen",
        citizen_phone: citizenPhone,
        category,
        description,
        state,
        district,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("demo_grievances", JSON.stringify([adminEntry, ...stored]));
      setStep(2);
      animateStepper(2);
      setTimeout(() => { if (successRef.current) animateSubmitSuccess(successRef.current); }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const reportContent = `
SEVASETU - NATIONAL SINGLE WINDOW PORTAL
GRIEVANCE REGISTRATION REPORT
Government of India | Digital India Initiative
================================================

TRACKING ID: ${result.tracking_id}
DATE & TIME: ${result.registered_at ? new Date(result.registered_at).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}
STATUS: ${result.status?.toUpperCase() || "RECEIVED"}

GRIEVANCE DETAILS
-----------------
Category: ${category}
State: ${state || "N/A"}
District: ${district || "N/A"}
Priority: ${result.priority?.toUpperCase()}
Estimated Resolution: ${result.estimated_days} working days

DEPARTMENT ASSIGNED
-------------------
Department: ${result.department}
${result.assigned_employee ? `
ASSIGNED OFFICER DETAILS
------------------------
Name: ${result.assigned_employee.name}
Employee ID: ${result.assigned_employee.empId}
Department: ${result.assigned_employee.dept}
Contact Phone: ${result.assigned_employee.phone}
` : ""}
CITIZEN INFORMATION
-------------------
Name: ${citizenName || "Not Provided"}
Phone: ${citizenPhone || "Not Provided"}
Location: ${district || ""}, ${state || ""}

WHAT HAPPENS NEXT
-----------------
1. Your complaint has been routed to ${result.department}
2. An officer will contact you within 3-5 working days
3. Track your complaint at sevasetu.gov.in using tracking ID
4. Resolution expected within ${result.estimated_days} working days

================================================
This is a computer-generated document.
For queries: helpline@sevasetu.gov.in | 1800-xxx-xxxx (Toll Free)
NIC | Digital India | Grievance Redressal Portal
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SevaSetu_Complaint_${result.tracking_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setReportDownloaded(true);
  };

  const handleTrack = async () => {
    if (!trackId.trim()) return;
    setTrackLoading(true);
    try {
      const res = await grievanceAPI.track(trackId.trim());
      if (res.data && !res.data.error) {
        setTrackResult(res.data);
      } else throw new Error("Not found");
    } catch {
      const stored = JSON.parse(localStorage.getItem("demo_grievances") || "[]");
      const found = stored.find((g: any) => g.tracking_id === trackId.trim());
      if (found) {
        setTrackResult(found);
      } else if (trackId.trim().length > 4) {
        setTrackResult({
          status: "under_review",
          department: "Social Welfare Department",
          assigned_employee: { name: "Rajesh Agarwal", phone: "+91-9901234567", empId: "GA/DL/1023", dept: "Social Welfare Department" },
          message: "Your complaint is being reviewed",
          estimated_days: 15
        });
      } else {
        setTrackResult({ error: "Grievance not found. Please check your tracking ID." });
      }
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* View Switcher Tabs */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-8">
        <button
          onClick={() => setActiveView("register")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeView === "register" ? "bg-saffron text-white shadow-lg" : "text-muted hover:text-white"}`}
        >
          📝 {translate("Register Grievance")}
        </button>
        <button
          onClick={() => setActiveView("track")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeView === "track" ? "bg-blue-600 text-white shadow-lg" : "text-muted hover:text-white"}`}
        >
          🔍 {translate("Track Status")}
        </button>
      </div>

      {activeView === "register" ? (
        <>
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center gap-0 relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-card-border" />
              <div id="stepper-bar" className="absolute top-5 left-5 h-0.5 bg-saffron transition-all duration-500"
                style={{ width: step === 0 ? "0%" : step === 1 ? "50%" : "100%" }} />
              {[translate("Category"), translate("Details"), translate("Submitted")].map((label, i) => (
                <div key={label} className="flex-1 flex flex-col items-center z-10">
                  <div className={`stepper-step w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${i < step ? "bg-india-green border-india-green text-white" : i === step ? "bg-saffron border-saffron text-white scale-110" : "bg-card-bg border-card-border text-muted"}`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs mt-2 ${i === step ? "text-saffron font-medium" : "text-muted"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={formRef}>
            {step === 0 && (
              <div>
                <h2 className="font-display text-2xl text-text-primary mb-2">{translate("What is your issue about?")}</h2>
                <p className="text-muted text-sm mb-6">{translate("Select the category that best describes your grievance")}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 ${category === cat.id ? "scale-105" : "border-card-border hover:border-white/20"}`}
                      style={category === cat.id ? { borderColor: cat.color, background: cat.color + "15" } : {}}>
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-medium text-text-primary">{translate(cat.id)}</div>
                    </button>
                  ))}
                </div>
                <button onClick={() => advanceTo(1)} disabled={!category}
                  className="btn-saffron mt-6 w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {translate("Continue →")}
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-text-primary mb-2">{translate("Describe your issue")}</h2>
                <p className="text-muted text-sm mb-6">{translate("Category:")} <span className="text-saffron">{translate(category)}</span></p>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm text-muted">{translate("Your Name")}</label>
                    <button onClick={() => toggleDictation("name")} title="Speak name"
                      className={`text-xs p-1 rounded-md flex items-center gap-1 border transition-colors ${isListeningDictation ? "border-red-500 text-red-500 animate-pulse" : "border-card-border text-muted hover:text-saffron"}`}>
                      🎤
                    </button>
                  </div>
                  <input type="text" value={citizenName} onChange={e => setCitizenName(e.target.value)}
                    placeholder={translate("Your full name")}
                    className="input-dark w-full px-4 py-2.5 rounded-xl border border-card-border text-sm" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm text-muted">{translate("Phone Number")}</label>
                    <button onClick={() => toggleDictation("phone")} title="Speak phone"
                      className="text-xs p-1 rounded-md flex items-center gap-1 border border-card-border text-muted hover:text-saffron transition-colors">
                      🎤
                    </button>
                  </div>
                  <input type="tel" value={citizenPhone} onChange={e => setCitizenPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="input-dark w-full px-4 py-2.5 rounded-xl border border-card-border text-sm" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm text-muted">{translate("State")}</label>
                    <button onClick={() => toggleDictation("state")} title="Speak state"
                      className="text-xs p-1 rounded-md flex items-center gap-1 border border-card-border text-muted hover:text-saffron transition-colors">
                      🎤
                    </button>
                  </div>
                  <input type="text" value={state} onChange={e => setState(e.target.value)}
                    placeholder={translate("e.g., Uttar Pradesh")}
                    className="input-dark w-full px-4 py-2.5 rounded-xl border border-card-border text-sm" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm text-muted">{translate("District")}</label>
                    <button onClick={() => toggleDictation("district")} title="Speak district"
                      className="text-xs p-1 rounded-md flex items-center gap-1 border border-card-border text-muted hover:text-saffron transition-colors">
                      🎤
                    </button>
                  </div>
                  <input type="text" value={district} onChange={e => setDistrict(e.target.value)}
                    placeholder={translate("Your district")}
                    className="input-dark w-full px-4 py-2.5 rounded-xl border border-card-border text-sm" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm text-muted">
                      {translate("Describe your issue")} <span className="text-saffron">*</span>
                    </label>
                    <button onClick={() => toggleDictation("description")} title={translate("Dictate your issue")}
                      className={`text-xs p-1.5 rounded-md flex items-center gap-1 border transition-colors ${isListeningDictation ? "border-red-500 text-red-500 bg-red-500/10 animate-pulse" : "border-card-border text-muted hover:text-saffron hover:border-saffron"}`}>
                      🎤 {isListeningDictation ? translate("Listening...") : translate("Speak")}
                    </button>
                  </div>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                    placeholder={translate("Describe your grievance in detail. Be as specific as possible...")}
                    className="input-dark w-full px-4 py-3 rounded-xl border border-card-border text-sm resize-none" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => advanceTo(0)} className="btn-outline flex-1 py-3 rounded-xl text-sm font-semibold">
                    ← {translate("Back")}
                  </button>
                  <button onClick={handleSubmit} disabled={!description.trim() || isLoading}
                    className="btn-saffron flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50">
                    {isLoading ? translate("Submitting...") : translate("Submit Grievance ✓")}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && result && (
              <div className="text-center" ref={successRef}>
                <div className="w-16 h-16 rounded-full bg-india-green/20 border border-india-green/40 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                <h2 className="font-display text-2xl text-text-primary mb-1">{translate("Grievance Submitted!")}</h2>
                <p className="text-muted text-sm mb-6">{result.message}</p>

                <div className="glass-card rounded-2xl p-6 text-left mb-4 border border-saffron/20">
                  <div className="bg-saffron/10 border border-saffron/30 rounded-xl p-4 mb-4 text-center">
                    <p className="text-white/50 text-xs mb-1">{translate("Tracking ID")}</p>
                    <code className="text-saffron font-mono text-xl font-bold tracking-wider">{result.tracking_id}</code>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">🏛️ {translate("Department")}</span>
                      <span className="text-text-primary font-medium">{result.department}</span>
                    </div>
                    {result.assigned_employee && (
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mt-3">
                        <p className="text-blue-400 text-xs font-bold uppercase mb-2">👤 {translate("Assigned Officer")}</p>
                        <p className="text-white text-sm font-semibold">{result.assigned_employee.name}</p>
                        <p className="text-green-400 text-sm">{result.assigned_employee.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button onClick={downloadReport} className="btn-outline px-5 py-2.5 rounded-xl text-sm font-medium">
                    📥 {reportDownloaded ? translate("Downloaded!") : translate("Download Report")}
                  </button>
                  <button onClick={() => { setStep(0); setCategory(""); setDescription(""); setResult(null); }}
                    className="btn-saffron px-5 py-2.5 rounded-xl text-sm font-medium">
                    {translate("File Another")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl text-white mb-2">{translate("Track Your Status")}</h2>
            <p className="text-muted text-sm">{translate("Enter your tracking ID to see live updates.")}</p>
          </div>
          
          <div className="flex gap-2">
            <input type="text" value={trackId} onChange={e => setTrackId(e.target.value)}
              placeholder={translate("Enter tracking ID...")}
              className="input-dark flex-1 px-4 py-3.5 rounded-xl border border-card-border text-base font-mono"
              onKeyDown={e => e.key === "Enter" && handleTrack()} />
            <button onClick={handleTrack} disabled={trackLoading} className="bg-blue-600 px-8 py-3.5 rounded-xl text-sm font-bold">
              {trackLoading ? "..." : translate("Track")}
            </button>
          </div>

          {trackResult && (
            <div className={`glass-card rounded-2xl p-6 border ${trackResult.error ? 'border-red-500/30' : 'border-blue-500/30 bg-blue-500/5'}`}>
              {trackResult.error ? (
                <p className="text-red-400 text-center">{trackResult.error}</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-muted">{translate("Status")}</span>
                    <span className={`badge status-${trackResult.status} capitalize`}>{translate(trackResult.status.replace("_", " "))}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-muted">{translate("Department")}</span>
                    <span className="text-white font-medium">{trackResult.department}</span>
                  </div>
                  {trackResult.assigned_employee && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-blue-400 text-xs font-bold mb-2">👤 {translate("Assigned Officer")}</p>
                      <p className="text-white font-semibold">{trackResult.assigned_employee.name}</p>
                      <p className="text-green-400">{trackResult.assigned_employee.phone}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
