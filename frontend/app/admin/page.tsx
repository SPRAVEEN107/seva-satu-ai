"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://seva-satu-ai.onrender.com";

const DEPARTMENTS = [
    "Department of Food & Civil Supplies",
    "Department of Agriculture and Farmers Welfare",
    "Department of Health and Family Welfare",
    "Department of School Education and Literacy",
    "Department of Rural Development",
    "Social Welfare Department",
    "General Administration"
];

const STATUSES = ["received", "under_review", "processed", "resolved", "rejected"];

const PRIORITY_ORDER: Record<string, number> = { high: 0, normal: 1, low: 2 };
const PRIORITY_COLOR: Record<string, string> = {
    high: "text-red-400 bg-red-400/10 border-red-400/30",
    normal: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    low: "text-green-400 bg-green-400/10 border-green-400/30",
};
const STATUS_COLOR: Record<string, string> = {
    received: "text-blue-400 bg-blue-400/10",
    under_review: "text-amber-400 bg-amber-400/10",
    processed: "text-purple-400 bg-purple-400/10",
    resolved: "text-green-400 bg-green-400/10",
    rejected: "text-red-400 bg-red-400/10",
};

// ─── Sample demo data — always visible ────────────────────────────────────────
const DEMO_GRIEVANCES = [
    {
        tracking_id: "GRV-20250314-X8Y2",
        citizen_name: "Manikanta Reddy",
        category: "Pension",
        description: "My father's pension is not credited for last 3 months. We are in urgent need of resolution.",
        department: "Social Welfare Department",
        status: "received",
        priority: "high",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        district: "Hyderabad",
        state: "Telangana",
        _source: "demo",
    },
    {
        tracking_id: "GRV-20250314-P5Q9",
        citizen_name: "Ramesh Kumar",
        category: "Ration Card",
        description: "New ration card application is pending with local authority for 2 months with no response.",
        department: "Department of Food & Civil Supplies",
        status: "under_review",
        priority: "normal",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        district: "Lucknow",
        state: "Uttar Pradesh",
        _source: "demo",
    },
    {
        tracking_id: "GRV-20250314-H3K1",
        citizen_name: "Priya Sharma",
        category: "Healthcare",
        description: "Ayushman Bharat card not issued despite eligible. Hospital denied cashless treatment.",
        department: "Department of Health and Family Welfare",
        status: "under_review",
        priority: "high",
        created_at: new Date(Date.now() - 1800000).toISOString(),
        district: "Pune",
        state: "Maharashtra",
        _source: "demo",
    },
    {
        tracking_id: "GRV-20250313-M7N4",
        citizen_name: "Sunita Devi",
        category: "MNREGA",
        description: "MNREGA wages not paid for 45 days of work completed. Job card number JC-UP-2024-4512.",
        department: "Department of Rural Development",
        status: "processed",
        priority: "normal",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        district: "Varanasi",
        state: "Uttar Pradesh",
        _source: "demo",
    },
];

export default function AdminGrievancePage() {
    const [grievances, setGrievances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
    const [filterDept, setFilterDept] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "hierarchy">("list");
    const [dbStatus, setDbStatus] = useState<"connecting" | "connected" | "offline">("connecting");

    useEffect(() => {
        loadGrievances();
    }, []);

    const loadGrievances = async () => {
        // 1. Show demo + localStorage data IMMEDIATELY (no blank state)
        const localRaw: any[] = JSON.parse(localStorage.getItem("demo_grievances") || "[]");
        const localGrievances = localRaw.map((g: any) => ({
            ...g,
            _source: g._source || "local",
            citizen_name: g.citizen_name || "Citizen",
        }));

        const localIds = new Set(localGrievances.map((g: any) => g.tracking_id));
        const filteredDemo = DEMO_GRIEVANCES.filter((d) => !localIds.has(d.tracking_id));

        setGrievances([...localGrievances, ...filteredDemo]);
        setLoading(false);

        // 2. Fetch real DB records in background
        try {
            const res = await axios.get(`${API_URL}/grievance/admin/all`, { timeout: 10000 });
            const dbData: any[] = res.data || [];
            const dbRecords = dbData.map((g: any) => ({
                ...g,
                _source: "db",
                citizen_name: g.citizen_name || "Citizen",
            }));
            setDbStatus("connected");

            if (dbRecords.length > 0) {
                const dbIds = new Set(dbRecords.map((g: any) => g.tracking_id));
                const nonDbLocal = localGrievances.filter((g: any) => !dbIds.has(g.tracking_id));
                const nonDbDemo = filteredDemo.filter((d: any) => !dbIds.has(d.tracking_id));
                setGrievances([...dbRecords, ...nonDbLocal, ...nonDbDemo]);
            } else {
                setDbStatus("connected");
            }
        } catch (err) {
            console.error("Cannot reach backend:", err);
            setDbStatus("offline");
        }
    };

    const handleUpdate = async (trackingId: string, updates: any) => {
        // Update locally first for instant feedback
        setGrievances((prev) =>
            prev.map((g) => (g.tracking_id === trackingId ? { ...g, ...updates } : g))
        );
        setSelectedGrievance((prev: any) => (prev ? { ...prev, ...updates } : prev));

        try {
            await axios.patch(`${API_URL}/grievance/admin/update/${trackingId}`, updates);
        } catch {
            console.warn("Update to DB failed (offline mode), applied locally only");
        }
    };

    // Build hierarchy: Department → Priority → Grievances
    const buildHierarchy = () => {
        const map: Record<string, Record<string, any[]>> = {};
        filtered.forEach((g) => {
            const dept = g.department || "General Administration";
            const prio = g.priority || "normal";
            if (!map[dept]) map[dept] = {};
            if (!map[dept][prio]) map[dept][prio] = [];
            map[dept][prio].push(g);
        });
        return map;
    };

    const filtered = grievances
        .filter((g) => filterDept === "all" || g.department === filterDept)
        .filter((g) => filterPriority === "all" || g.priority === filterPriority)
        .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1));

    const hierarchy = buildHierarchy();

    const SourceBadge = ({ source }: { source: string }) => {
        if (source === "db")
            return <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-0.5 rounded-full">🟢 LIVE DB</span>;
        if (source === "local")
            return <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2 py-0.5 rounded-full">📱 Submitted</span>;
        return <span className="text-[10px] font-bold text-gray-400 bg-gray-400/10 border border-gray-400/20 px-2 py-0.5 rounded-full">DEMO</span>;
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-dark-bg pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4">

                    {/* ─── Header ─────────────────────────────── */}
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                        <div>
                            <h1 className="font-display text-3xl text-text-primary">Admin Control Center</h1>
                            <p className="text-muted mt-1">Real-time grievance management across all departments.</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                                    dbStatus === "connected" ? "text-green-400 bg-green-400/10 border-green-400/30" :
                                    dbStatus === "offline" ? "text-red-400 bg-red-400/10 border-red-400/30" :
                                    "text-amber-400 bg-amber-400/10 border-amber-400/30"
                                }`}>
                                    {dbStatus === "connected" ? "🟢 DB Connected" : dbStatus === "offline" ? "🔴 DB Offline" : "🟡 Connecting..."}
                                </span>
                                <span className="text-sm text-green-400 font-bold">
                                    {grievances.filter(g => g._source === "db").length} DB records
                                </span>
                                <span className="text-sm text-blue-400 font-bold">
                                    {grievances.filter(g => g._source === "local").length} Submitted
                                </span>
                                <span className="text-sm text-muted">
                                    {filtered.length} total shown
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={loadGrievances}
                                className="btn-outline px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                🔄 Refresh
                            </button>
                            <button
                                onClick={() => setViewMode(viewMode === "list" ? "hierarchy" : "list")}
                                className="btn-saffron px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                {viewMode === "list" ? "🌳 Hierarchy View" : "📋 List View"}
                            </button>
                            <select
                                className="input-dark rounded-lg px-3 py-2 text-sm"
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                            >
                                <option value="all">All Departments</option>
                                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select
                                className="input-dark rounded-lg px-3 py-2 text-sm"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                            >
                                <option value="all">All Priorities</option>
                                <option value="high">🔴 High</option>
                                <option value="normal">🟡 Normal</option>
                                <option value="low">🟢 Low</option>
                            </select>
                        </div>
                    </div>

                    {/* ─── Stats Row ──────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                        {STATUSES.map((s) => {
                            const count = grievances.filter(g => g.status === s).length;
                            return (
                                <div key={s} className="glass-card rounded-xl p-3 text-center border border-card-border">
                                    <div className={`text-lg font-bold ${STATUS_COLOR[s]?.split(" ")[0]}`}>{count}</div>
                                    <div className="text-[10px] text-muted uppercase tracking-wide mt-0.5">{s.replace("_", " ")}</div>
                                </div>
                            );
                        })}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
                        </div>
                    ) : viewMode === "list" ? (
                        /* ─── LIST VIEW ──────────────────────── */
                        <div className="grid grid-cols-1 gap-4">
                            {filtered.length === 0 ? (
                                <div className="glass-card rounded-2xl p-12 text-center text-muted">
                                    No grievances found.
                                </div>
                            ) : (
                                filtered.map((g) => (
                                    <div
                                        key={g.tracking_id}
                                        onClick={() => setSelectedGrievance(g)}
                                        className="glass-card rounded-2xl p-5 border border-card-border hover:border-saffron/40 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <code className="text-xs font-mono text-saffron bg-saffron/10 px-2 py-0.5 rounded">{g.tracking_id}</code>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${STATUS_COLOR[g.status] || ""}`}>{g.status?.replace("_", " ")}</span>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${PRIORITY_COLOR[g.priority] || ""}`}>{g.priority}</span>
                                                    <SourceBadge source={g._source} />
                                                    <span className="text-xs text-muted">👤 {g.citizen_name || "Anonymous"}</span>
                                                    {g.district && <span className="text-xs text-muted">📍 {g.district}, {g.state}</span>}
                                                </div>
                                                <h3 className="text-base font-semibold text-text-primary group-hover:text-saffron transition-colors">{g.category}</h3>
                                                <p className="text-sm text-muted mt-1 line-clamp-2">{g.description}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs text-muted">{new Date(g.created_at).toLocaleString("en-IN")}</div>
                                                <div className="text-xs font-medium text-cobalt bg-cobalt/10 px-2 py-1 rounded-full border border-cobalt/20 mt-1">{g.department}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* ─── HIERARCHY VIEW ─────────────────── */
                        <div className="space-y-6">
                            {Object.entries(hierarchy).map(([dept, priorities]) => (
                                <div key={dept} className="glass-card rounded-2xl border border-card-border overflow-hidden">
                                    {/* Department Header */}
                                    <div className="px-6 py-4 border-b border-card-border bg-gradient-to-r from-cobalt/10 to-transparent flex items-center justify-between">
                                        <div>
                                            <h2 className="text-base font-bold text-text-primary">🏛️ {dept}</h2>
                                            <p className="text-xs text-muted mt-0.5">{Object.values(priorities).flat().length} complaint(s)</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {Object.entries(priorities).map(([prio, items]) => (
                                                <span key={prio} className={`text-[10px] font-bold px-2 py-1 rounded-full border ${PRIORITY_COLOR[prio]}`}>
                                                    {prio}: {items.length}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Priority Groups */}
                                    {(["high", "normal", "low"] as const).filter(p => priorities[p]).map((prio) => (
                                        <div key={prio} className="border-b border-card-border last:border-0">
                                            <div className={`px-6 py-2 flex items-center gap-2 border-b border-card-border/40 ${
                                                prio === "high" ? "bg-red-400/5" : prio === "normal" ? "bg-amber-400/5" : "bg-green-400/5"
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${prio === "high" ? "bg-red-400" : prio === "normal" ? "bg-amber-400" : "bg-green-400"}`} />
                                                <span className={`text-xs font-bold uppercase tracking-wider ${prio === "high" ? "text-red-400" : prio === "normal" ? "text-amber-400" : "text-green-400"}`}>
                                                    {prio} Priority — {priorities[prio].length} complaint(s)
                                                </span>
                                            </div>
                                            {priorities[prio].map((g: any, idx: number) => (
                                                <div
                                                    key={g.tracking_id}
                                                    onClick={() => setSelectedGrievance(g)}
                                                    className="px-6 py-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-card-border/30 last:border-0"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3">
                                                            {/* Tree connector */}
                                                            <div className="flex flex-col items-center pt-1">
                                                                <div className={`w-0.5 h-3 ${prio === "high" ? "bg-red-400/30" : prio === "normal" ? "bg-amber-400/30" : "bg-green-400/30"}`} />
                                                                <div className={`w-2 h-2 rounded-full border-2 ${prio === "high" ? "border-red-400 bg-red-400/20" : prio === "normal" ? "border-amber-400 bg-amber-400/20" : "border-green-400 bg-green-400/20"}`} />
                                                            </div>
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                    <code className="text-xs font-mono text-saffron">{g.tracking_id}</code>
                                                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${STATUS_COLOR[g.status] || ""}`}>{g.status?.replace("_", " ")}</span>
                                                                    <SourceBadge source={g._source} />
                                                                </div>
                                                                <p className="text-sm font-medium text-text-primary">{g.category} — <span className="text-muted font-normal text-xs">{g.description?.slice(0, 80)}...</span></p>
                                                                <div className="flex gap-3 mt-1 text-xs text-muted">
                                                                    <span>👤 {g.citizen_name || "Anonymous"}</span>
                                                                    {g.district && <span>📍 {g.district}</span>}
                                                                    <span>🕐 {new Date(g.created_at).toLocaleDateString("en-IN")}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Detail Slide-over ──────────────────────────────── */}
                {selectedGrievance && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGrievance(null)} />
                        <div className="relative w-full max-w-md bg-[#0D0D15] border-l border-card-border h-full p-8 shadow-2xl overflow-y-auto">
                            <button onClick={() => setSelectedGrievance(null)} className="absolute top-6 right-6 text-muted hover:text-text-primary">✕</button>
                            <h2 className="text-2xl font-display text-text-primary mb-1">Process Grievance</h2>
                            <p className="text-sm text-saffron font-mono mb-2">{selectedGrievance.tracking_id}</p>
                            <SourceBadge source={selectedGrievance._source} />

                            <div className="space-y-5 mt-6">
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Citizen</label>
                                    <div className="glass-card rounded-xl p-3 text-sm text-text-primary">{selectedGrievance.citizen_name || "Anonymous"}{selectedGrievance.district ? ` — ${selectedGrievance.district}, ${selectedGrievance.state}` : ""}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Category</label>
                                    <div className="glass-card rounded-xl p-3 text-sm text-text-primary">{selectedGrievance.category}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Description</label>
                                    <div className="glass-card rounded-xl p-4 text-sm text-muted leading-relaxed italic border-l-2 border-saffron/30">"{selectedGrievance.description}"</div>
                                </div>
                                <hr className="border-card-border" />
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Assign Department</label>
                                    <select
                                        className="w-full input-dark rounded-xl p-3 text-sm"
                                        defaultValue={selectedGrievance.department}
                                        onChange={(e) => handleUpdate(selectedGrievance.tracking_id, { department: e.target.value })}
                                    >
                                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Update Status</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {STATUSES.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleUpdate(selectedGrievance.tracking_id, { status: s })}
                                                className={`text-xs p-3 rounded-xl border transition-all ${selectedGrievance.status === s ? "bg-saffron text-white border-saffron" : "border-card-border text-muted hover:border-white/30"}`}
                                            >
                                                {s.replace("_", " ")}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Internal Note</label>
                                    <textarea
                                        placeholder="Enter response for the citizen..."
                                        className="w-full input-dark rounded-xl p-3 text-sm min-h-[80px]"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && e.ctrlKey) {
                                                handleUpdate(selectedGrievance.tracking_id, { event_text: (e.target as any).value });
                                            }
                                        }}
                                    />
                                    <p className="text-[10px] text-muted mt-1">Press Ctrl+Enter to save note.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
