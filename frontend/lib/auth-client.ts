"use client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://seva-satu-ai.onrender.com").replace(/\/$/, "");

export const authClient = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("auth_token", token);
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("auth_token");
    }
    return null;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  },

  fetch: async (endpoint: string, options: RequestInit = {}) => {
    const token = authClient.getToken();
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      authClient.logout();
    }

    return response;
  },

  getCurrentUser: async () => {
    const response = await authClient.fetch("/auth/me");
    if (response.ok) {
      return await response.json();
    }
    return null;
  }
};
