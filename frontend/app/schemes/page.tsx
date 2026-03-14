"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SchemeCard from "@/components/SchemeCard";
import { schemesAPI, type Scheme } from "@/lib/api";
import { animateCards } from "@/lib/gsap";
import { useLanguage } from "@/lib/LanguageContext";

const CATEGORIES = ["All", "Women", "BPL", "PM Schemes", "Agriculture", "Health", "Housing", "Education", "Business", "Employment", "SC/ST", "Minority"];

const STATES_WITH_UT: { label: string; value: string; type: "state" | "ut" }[] = [
  // States
  { label: "Andhra Pradesh", value: "Andhra Pradesh", type: "state" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh", type: "state" },
  { label: "Assam", value: "Assam", type: "state" },
  { label: "Bihar", value: "Bihar", type: "state" },
  { label: "Chhattisgarh", value: "Chhattisgarh", type: "state" },
  { label: "Goa", value: "Goa", type: "state" },
  { label: "Gujarat", value: "Gujarat", type: "state" },
  { label: "Haryana", value: "Haryana", type: "state" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh", type: "state" },
  { label: "Jharkhand", value: "Jharkhand", type: "state" },
  { label: "Karnataka", value: "Karnataka", type: "state" },
  { label: "Kerala", value: "Kerala", type: "state" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh", type: "state" },
  { label: "Maharashtra", value: "Maharashtra", type: "state" },
  { label: "Manipur", value: "Manipur", type: "state" },
  { label: "Meghalaya", value: "Meghalaya", type: "state" },
  { label: "Mizoram", value: "Mizoram", type: "state" },
  { label: "Nagaland", value: "Nagaland", type: "state" },
  { label: "Odisha", value: "Odisha", type: "state" },
  { label: "Punjab", value: "Punjab", type: "state" },
  { label: "Rajasthan", value: "Rajasthan", type: "state" },
  { label: "Sikkim", value: "Sikkim", type: "state" },
  { label: "Tamil Nadu", value: "Tamil Nadu", type: "state" },
  { label: "Telangana", value: "Telangana", type: "state" },
  { label: "Tripura", value: "Tripura", type: "state" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh", type: "state" },
  { label: "Uttarakhand", value: "Uttarakhand", type: "state" },
  { label: "West Bengal", value: "West Bengal", type: "state" },
  // Union Territories
  { label: "Andaman & Nicobar", value: "Andaman & Nicobar", type: "ut" },
  { label: "Chandigarh", value: "Chandigarh", type: "ut" },
  { label: "Dadra & Nagar Haveli", value: "Dadra & Nagar Haveli", type: "ut" },
  { label: "Daman & Diu", value: "Daman & Diu", type: "ut" },
  { label: "Delhi", value: "Delhi", type: "ut" },
  { label: "Lakshadweep", value: "Lakshadweep", type: "ut" },
  { label: "Puducherry", value: "Puducherry", type: "ut" },
  { label: "Ladakh", value: "Ladakh", type: "ut" },
  { label: "Jammu & Kashmir", value: "Jammu & Kashmir", type: "ut" },
];

// Static state schemes data for demo (comprehensive)
const STATE_SCHEMES: Record<string, { name: string; desc: string; category: string; benefit: string }[]> = {
  "Uttar Pradesh": [
    { name: "Kanya Sumangala Yojana", desc: "Financial support for girl child from birth to graduation", category: "Women", benefit: "₹15,000 total" },
    { name: "UP Pension Yojana", desc: "Old age, widow and divyang pension scheme", category: "BPL", benefit: "₹500/month" },
    { name: "Mukhyamantri Awas Yojana UP", desc: "Housing for BPL families in rural areas", category: "Housing", benefit: "₹1.2 Lakh" },
    { name: "UP Scholarship", desc: "Scholarship for SC/ST/OBC students", category: "Education", benefit: "₹8,000-25,000" },
    { name: "Vishwakarma Shram Samman", desc: "Skill development for artisans", category: "Employment", benefit: "₹10,000-10 Lakh" },
  ],
  "Maharashtra": [
    { name: "Majhi Kanya Bhagyashri", desc: "Scheme for girl child education and welfare", category: "Women", benefit: "₹50,000" },
    { name: "Atal Mahila Shakti Yojana", desc: "Financial assistance to women entrepreneurs", category: "Women", benefit: "₹3 Lakh loan" },
    { name: "Ramai Awas Yojana", desc: "Housing for SC/BPL families", category: "BPL", benefit: "₹1.5 Lakh" },
    { name: "Shiv Bhojan Thali", desc: "Affordable meals at ₹10 for BPL citizens", category: "BPL", benefit: "₹10 meal" },
  ],
  "Bihar": [
    { name: "Mukhyamantri Kanya Utthan Yojana", desc: "₹50,000 for every girl from birth to graduation", category: "Women", benefit: "₹50,000" },
    { name: "Bihar Har Ghar Bijli", desc: "Electricity connection to every household", category: "BPL", benefit: "Free connection" },
    { name: "Student Credit Card", desc: "Education loan for higher studies", category: "Education", benefit: "₹4 Lakh" },
  ],
  "Tamil Nadu": [
    { name: "Kalaignar Magalir Urimai Thittam", desc: "₹1,000/month cash transfer to women", category: "Women", benefit: "₹1,000/month" },
    { name: "Amma Unavagam", desc: "Subsidised meals for public", category: "BPL", benefit: "₹5-20 meals" },
    { name: "Chief Minister's Girl Child Protection Scheme", desc: "Welfare of girl children in BPL families", category: "Women", benefit: "₹50,000" },
  ],
  "Rajasthan": [
    { name: "Indira Gandhi Matritva Poshan Yojana", desc: "Nutrition support to pregnant women", category: "Women", benefit: "₹6,000" },
    { name: "Rajasthan Jan Aadhaar", desc: "Single identity card for all government benefits", category: "BPL", benefit: "All schemes" },
    { name: "Mukhyamantri Rajshri Yojana", desc: "Girl child welfare from birth to class 12", category: "Women", benefit: "₹50,000" },
  ],
  "Karnataka": [
    { name: "Gruha Jyothi", desc: "Free 200 units electricity to households", category: "BPL", benefit: "Free electricity" },
    { name: "Anna Bhagya", desc: "Free rice to BPL families", category: "BPL", benefit: "10kg rice free" },
    { name: "Shakti Scheme", desc: "Free bus travel for women", category: "Women", benefit: "Free travel" },
  ],
  "West Bengal": [
    { name: "Lakshmir Bhandar", desc: "Monthly cash assistance to homemakers", category: "Women", benefit: "₹500-1,000/month" },
    { name: "Kanyashree Prakalpa", desc: "Financial incentive for girl children education", category: "Women", benefit: "₹25,000" },
    { name: "Krishak Bandhu", desc: "Financial support to farmers", category: "Agriculture", benefit: "₹10,000/year" },
  ],
  "Andhra Pradesh": [
    { name: "YSR Cheyutha", desc: "Financial assistance to women from BC/SC/ST/Minority", category: "Women", benefit: "₹18,750/year" },
    { name: "Jagananna Amma Vodi", desc: "₹15,000 per year for mothers of school-going children", category: "Women", benefit: "₹15,000/year" },
    { name: "YSR Pension Kanuka", desc: "Enhanced pension for old age/widow/divyang", category: "BPL", benefit: "₹2,750/month" },
  ],
  "Gujarat": [
    { name: "Mukhyamantri Mahila Utkarsh Yojana", desc: "Interest-free loans for women's groups", category: "Women", benefit: "₹1 Lakh" },
    { name: "PMEGP Gujarat", desc: "Employment generation for rural/urban poor", category: "Employment", benefit: "₹25-50 Lakh" },
    { name: "Vatsalya - Maa Amrutam Yojana", desc: "Health insurance for BPL families", category: "Health", benefit: "₹5 Lakh health cover" },
  ],
};

const PM_SCHEMES = [
  { name: "PM Awas Yojana (PMAY)", desc: "Housing for all by 2024 - Rural & Urban", category: "Housing", benefit: "₹1.2-2.5 Lakh", level: "Central" },
  { name: "PM Kisan Samman Nidhi", desc: "₹6,000/year direct income support to farmers", category: "Agriculture", benefit: "₹6,000/year", level: "Central" },
  { name: "PM Jan Dhan Yojana", desc: "Financial inclusion for unbanked citizens", category: "BPL", benefit: "Zero-balance account + ₹2L insurance", level: "Central" },
  { name: "Ayushman Bharat - PMJAY", desc: "₹5 Lakh health insurance for BPL families", category: "Health", benefit: "₹5 Lakh/year", level: "Central" },
  { name: "PM Mudra Yojana", desc: "Loans for micro & small enterprises up to ₹10L", category: "Business", benefit: "₹50K-10 Lakh loan", level: "Central" },
  { name: "PM Ujjwala Yojana", desc: "Free LPG connections to BPL women", category: "Women", benefit: "Free LPG + subsidy", level: "Central" },
  { name: "PM Matru Vandana Yojana", desc: "Maternity benefit program for pregnant women", category: "Women", benefit: "₹5,000", level: "Central" },
  { name: "Beti Bachao Beti Padhao", desc: "Welfare of girl child - education & protection", category: "Women", benefit: "Multiple benefits", level: "Central" },
  { name: "PM Vishwakarma Scheme", desc: "Support to traditional artisans and craftsmen", category: "Employment", benefit: "₹15,000 toolkit + loan", level: "Central" },
  { name: "Sukanya Samriddhi Yojana", desc: "Savings scheme for girl child", category: "Women", benefit: "High interest 8.2%", level: "Central" },
  { name: "MGNREGS", desc: "100 days guaranteed employment for rural workers", category: "Employment", benefit: "100 days/year wages", level: "Central" },
  { name: "PM Garib Kalyan Ann Yojana", desc: "Free food grains to 80 crore beneficiaries", category: "BPL", benefit: "5 kg grain/month free", level: "Central" },
];

const BPL_SCHEMES = [
  { name: "Antyodaya Anna Yojana (AAY)", desc: "Cheapest ration for poorest of poor families", category: "BPL", benefit: "35 kg grain at ₹2-3/kg" },
  { name: "National Social Assistance Programme", desc: "Social security for BPL elderly, widows, disabled", category: "BPL", benefit: "₹200-500/month" },
  { name: "Pradhan Mantri Jeevan Jyoti Bima", desc: "Life insurance at just ₹436/year", category: "BPL", benefit: "₹2 Lakh life cover" },
  { name: "PM Suraksha Bima Yojana", desc: "Accidental insurance at ₹20/year", category: "BPL", benefit: "₹2 Lakh accident cover" },
];

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { translate } = useLanguage();

  const [selectedState, setSelectedState] = useState("");
  const [category, setCategory] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [activeTab, setActiveTab] = useState<"central" | "state" | "pm" | "bpl" | "women">("central");
  const [stateQuery, setStateQuery] = useState("");
  const router = useRouter();

  const handleApply = (schemeName: string) => {
    router.push(`/grievance?scheme=${encodeURIComponent(schemeName)}`);
  };

  const fetchSchemes = async (newPage = 1) => {
    setLoading(true);
    try {
      const res = await schemesAPI.list({
        state: selectedState || undefined,
        category: category === "All" ? undefined : category || undefined,
        income_range: incomeRange || undefined,
        page: newPage,
        limit: 12,
      });
      setSchemes(res.data.schemes || []);
      setTotal(res.data.total || 0);
      setPage(newPage);
      setTimeout(() => animateCards(".scheme-grid .scheme-card"), 100);
    } catch {
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchemes(); }, []);

  const filteredStates = STATES_WITH_UT.filter(s =>
    s.label.toLowerCase().includes(stateQuery.toLowerCase())
  );
  const stateSchemes = selectedState ? (STATE_SCHEMES[selectedState] || []) : [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg pt-16" role="main">
        {/* Header */}
        <section className="py-10 px-4 text-center border-b border-card-border">
          <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
            {translate("Government Schemes")} — <span className="saffron-text">{translate("NSWP Portal")}</span>
          </h1>
          <p className="text-muted text-sm max-w-2xl mx-auto">
            {translate("All Central & State Government Schemes in one place. Select your home state to see applicable schemes.")}
          </p>
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { id: "central", label: "🏛️ Central Govt", key: "Central Govt" },
              { id: "state", label: "🗺️ State Schemes", key: "State Schemes" },
              { id: "pm", label: "👑 PM Schemes", key: "PM Schemes" },
              { id: "bpl", label: "🤲 BPL Schemes", key: "BPL Schemes" },
              { id: "women", label: "👩 Women Schemes", key: "Women Schemes" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeTab === tab.id
                  ? "bg-saffron border-saffron text-white"
                  : "border-white/10 text-white/60 hover:border-saffron/30 hover:text-white"
                  }`}>
                {translate(tab.key)}
              </button>
            ))}
          </div>
        </section>

        {/* State Selector */}
        {activeTab === "state" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h2 className="font-display text-xl text-white mb-4">🗺️ Select Your Home State</h2>
              <input
                type="text"
                value={stateQuery}
                onChange={e => setStateQuery(e.target.value)}
                placeholder="Search state or UT..."
                className="input-dark w-full px-4 py-2.5 rounded-xl border border-card-border text-sm mb-4"
                aria-label="Search states"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredStates.map(s => (
                  <button key={s.value} onClick={() => setSelectedState(s.value)}
                    aria-pressed={selectedState === s.value}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${selectedState === s.value
                      ? "bg-saffron/20 border-saffron text-saffron"
                      : "border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                      }`}>
                    {s.type === "ut" ? "🏙️ " : "🗺️ "}{s.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedState && (
              <div>
                <h3 className="font-display text-2xl text-white mb-2">
                  Schemes for <span className="text-saffron">{selectedState}</span>
                </h3>
                <p className="text-white/40 text-sm mb-4">Showing {stateSchemes.length} state government schemes</p>
                {stateSchemes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stateSchemes.map((s, i) => (
                      <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-saffron/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.category === "Women" ? "bg-pink-500/20 text-pink-400" : s.category === "BPL" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}>
                            {s.category}
                          </span>
                          <span className="text-xs text-saffron font-semibold bg-saffron/10 px-2 py-0.5 rounded-full">{s.benefit}</span>
                        </div>
                        <h4 className="font-display text-white text-base font-semibold mb-1">{s.name}</h4>
                        <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
                        <button 
                          onClick={() => handleApply(s.name)}
                          className="mt-3 text-xs text-saffron hover:text-orange-400 transition-colors font-medium flex items-center gap-1"
                        >
                          Apply Now →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass-card rounded-2xl">
                    <div className="text-4xl mb-3">🏛️</div>
                    <p className="text-white/50">State-specific scheme data loading from NIC...</p>
                    <p className="text-white/30 text-xs mt-1">Check myscheme.gov.in for the latest data</p>
                  </div>
                )}
              </div>
            )}
            {!selectedState && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🗺️</div>
                <p className="text-white/50 text-lg">Select your home state above to see all state government schemes</p>
              </div>
            )}
          </div>
        )}

        {/* PM Schemes */}
        {activeTab === "pm" && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="font-display text-2xl text-white mb-6">👑 Prime Minister&apos;s Schemes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PM_SCHEMES.map((s, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-green-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">{s.category}</span>
                    <span className="text-xs text-saffron font-semibold bg-saffron/10 px-2 py-0.5 rounded-full">{s.benefit}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                    <span className="text-base">🇮🇳</span>
                  </div>
                  <h4 className="font-display text-white text-sm font-semibold mb-1">{s.name}</h4>
                  <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
                  <button 
                    onClick={() => handleApply(s.name)}
                    className="mt-3 text-xs text-green-400 hover:text-green-300 transition-colors font-medium"
                  >
                    Apply Now →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BPL Schemes */}
        {activeTab === "bpl" && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="font-display text-2xl text-white mb-2">🤲 Below Poverty Line (BPL) Schemes</h2>
            <p className="text-white/40 text-sm mb-6">Schemes specifically designed for families below poverty line</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...BPL_SCHEMES, ...PM_SCHEMES.filter(s => s.category === "BPL")].map((s, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-orange-500/30 transition-all">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-500/20 text-orange-400 mb-3 block w-fit">BPL</span>
                  <h4 className="font-display text-white text-sm font-semibold mb-1">{s.name}</h4>
                  <p className="text-white/50 text-xs leading-relaxed mb-2">{s.desc}</p>
                  <span className="text-xs text-saffron font-semibold">{s.benefit}</span>
                  <button 
                    onClick={() => handleApply(s.name)}
                    className="mt-3 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium flex items-center gap-1 ml-auto"
                  >
                    Apply →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Women Schemes */}
        {activeTab === "women" && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl text-white mb-2">👩 Women Empowerment Schemes</h2>
              <p className="text-white/40 text-sm">Central + All State Government Schemes for Women</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...PM_SCHEMES.filter(s => s.category === "Women"),
              ...Object.entries(STATE_SCHEMES).flatMap(([state, schemes]) =>
                schemes.filter(s => s.category === "Women").map(s => ({ ...s, stateName: state }))
              )].map((s: any, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-pink-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-pink-500/20 text-pink-400">Women</span>
                    {s.stateName && <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{s.stateName}</span>}
                    {s.level && <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Central</span>}
                  </div>
                  <h4 className="font-display text-white text-sm font-semibold mb-1">{s.name}</h4>
                  <p className="text-white/50 text-xs leading-relaxed mb-2">{s.desc}</p>
                  <span className="text-xs text-saffron font-semibold">{s.benefit}</span>
                  <button 
                    onClick={() => handleApply(s.name)}
                    className="mt-3 text-xs text-pink-400 hover:text-pink-300 transition-colors font-medium flex items-center gap-1 ml-auto"
                  >
                    Apply Now →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Central Govt Schemes (API-backed) */}
        {activeTab === "central" && (
          <>
            {/* Sticky Filters */}
            <div className="sticky top-16 z-30 bg-card-bg border-b border-card-border py-4 px-4">
              <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
                <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
                  className="input-dark px-3 py-2 rounded-lg border border-card-border text-sm bg-card-bg"
                  aria-label="Select state">
                  <option value="">All States</option>
                  {STATES_WITH_UT.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat === "All" ? "" : cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${(cat === "All" && !category) || category === cat
                        ? "bg-saffron border-saffron text-white"
                        : "border-card-border text-muted hover:border-saffron/40"
                        }`}>
                      {translate(cat)}
                    </button>
                  ))}
                </div>
                <select value={incomeRange} onChange={e => setIncomeRange(e.target.value)}
                  className="input-dark px-3 py-2 rounded-lg border border-card-border text-sm bg-card-bg"
                  aria-label="Select income range">
                  <option value="">{translate("Any Income")}</option>
                  <option value="low">{translate("Below ₹1 Lakh")}</option>
                  <option value="lower_mid">{translate("₹1–3 Lakh")}</option>
                  <option value="mid">{translate("₹3–6 Lakh")}</option>
                  <option value="upper_mid">{translate("₹6 Lakh+")}</option>
                </select>
                <button onClick={() => fetchSchemes(1)} className="btn-saffron px-5 py-2 rounded-lg text-sm font-medium ml-auto">
                  {translate("Apply Filters")}
                </button>
              </div>
            </div>

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
                    </div>
                  ))}
                </div>
              ) : schemes.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display text-xl text-text-primary mb-2">{translate("No schemes found")}</h3>
                  <p className="text-muted text-sm">{translate("Try adjusting your filters")}</p>
                  <p className="text-white/30 text-xs mt-2">Use the PM Schemes, BPL, or Women tabs to browse offline data</p>
                </div>
              ) : (
                <>
                  <p className="text-muted text-sm mb-6">{translate(`Showing ${schemes.length} of ${total} schemes`)}</p>
                  <div className="scheme-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schemes.map(scheme => (
                      <SchemeCard 
                        key={scheme.id} 
                        scheme={scheme} 
                        matchScore={80} 
                        onApply={() => handleApply(scheme.name)}
                      />
                    ))}
                  </div>
                  {total > 12 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button onClick={() => fetchSchemes(page - 1)} disabled={page === 1}
                        className="btn-outline px-4 py-2 rounded-lg text-sm disabled:opacity-40">← Prev</button>
                      <span className="px-4 py-2 text-sm text-muted">Page {page} of {Math.ceil(total / 12)}</span>
                      <button onClick={() => fetchSchemes(page + 1)} disabled={page >= Math.ceil(total / 12)}
                        className="btn-saffron px-4 py-2 rounded-lg text-sm disabled:opacity-40">Next →</button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
