import axios from "axios";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://savasetu-backend.onrender.com";

export const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatRequest {
    citizen_id?: string;
    message: string;
    language?: string;
    history?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
    reply: string;
    suggested_schemes: SuggestedScheme[];
    action_buttons: string[];
    language: string;
}

export interface SuggestedScheme {
    name: string;
    ministry?: string;
    benefit?: string;
    match_score?: number;
    apply_url?: string;
    eligibility_reason?: string;
    category?: string;
}

export interface EligibilityRequest {
    age?: number;
    gender?: string;
    state?: string;
    district?: string;
    occupation?: string;
    annual_income?: number;
    caste_category?: string;
    land_ownership?: boolean;
    family_size?: number;
    name?: string;
}

export interface EligibilityResponse {
    eligible_schemes: SuggestedScheme[];
    total_matched: number;
    profile_summary: {
        name: string;
        state?: string;
        occupation?: string;
    };
}

export interface GrievanceRequest {
    citizen_id?: string;
    category: string;
    description: string;
    district?: string;
    state?: string;
}

export interface GrievanceResponse {
    tracking_id: string;
    department: string;
    status: string;
    priority: string;
    estimated_days: number;
    message: string;
}

export interface Scheme {
    id: string;
    name: string;
    ministry?: string;
    category?: string;
    description?: string;
    benefit_amount?: string;
    eligibility_criteria?: Record<string, unknown>;
    apply_url?: string;
    state_specific?: string;
    is_active?: boolean;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const chatAPI = {
    sendMessage: (data: ChatRequest) =>
        api.post<ChatResponse>("/ai-chat/message", data),
};

export const schemesAPI = {
    list: (params?: {
        state?: string;
        category?: string;
        income_range?: string;
        age?: string;
        page?: number;
        limit?: number;
    }) => api.get<{ schemes: Scheme[]; total: number; page: number }>("/schemes/list", { params }),

    getById: (id: string) => api.get<Scheme>(`/schemes/${id}`),
};

export const eligibilityAPI = {
    check: (data: EligibilityRequest) =>
        api.post<EligibilityResponse>("/eligibility/check", data),
};

export const grievanceAPI = {
    submit: (data: GrievanceRequest) =>
        api.post<GrievanceResponse>("/grievance/submit", data),

    track: (trackingId: string) =>
        api.get(`/grievance/track/${trackingId}`),
};

export const applicationsAPI = {
    apply: (citizen_id: string, scheme_id: string) =>
        api.post("/applications/apply", { citizen_id, scheme_id }),

    getStatus: (citizen_id: string) =>
        api.get(`/applications/status/${citizen_id}`),
};

export const healthAPI = {
    check: () => api.get("/health"),
};

export default api;
