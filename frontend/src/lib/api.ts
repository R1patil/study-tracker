// import { createClient } from "./supabase/client";

// const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// async function authHeaders(): Promise<HeadersInit> {
//     const supabase = createClient();
//     const { data } = await supabase.auth.getSession();
//     const token = data.session?.access_token;
//     return {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };
// }

// async function apiFetch(path: string, options: RequestInit = {}) {
//     const headers = await authHeaders();
//     const res = await fetch(`${BASE}${path}`, {
//         ...options,
//         headers: { ...headers, ...(options.headers || {}) },
//         cache: "no-store",
//     });
//     if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
//     return res.json();
// }

// export const getStats = () => apiFetch("/stats");
// export const getProgress = () => apiFetch("/progress");
// export const getTimer = () => apiFetch("/timer");

// export const updateStatus = (topicId: string, status: string) =>
//     apiFetch(`/topic/${topicId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

// export const updateNotes = (topicId: string, notes: string) =>
//     apiFetch(`/topic/${topicId}/notes`, { method: "PATCH", body: JSON.stringify({ notes }) });

// export const controlTimer = (action: string, topicId?: string, topicTitle?: string) =>
//     apiFetch("/timer", { method: "POST", body: JSON.stringify({ action, topic_id: topicId, topic_title: topicTitle }) });



import { createClient } from "./supabase/client";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function authHeaders(): Promise<HeadersInit> {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const headers = await authHeaders();
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json();
}

export const getStats = () => apiFetch("/stats");
export const getProgress = () => apiFetch("/progress");
export const getTimer = () => apiFetch("/timer");

export const updateStatus = (topicId: string, status: string) =>
    apiFetch(`/topic/${topicId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

export const updateNotes = (topicId: string, notes: string) =>
    apiFetch(`/topic/${topicId}/notes`, { method: "PATCH", body: JSON.stringify({ notes }) });

export const controlTimer = (action: string, topicId?: string, topicTitle?: string) =>
    apiFetch("/timer", { method: "POST", body: JSON.stringify({ action, topic_id: topicId, topic_title: topicTitle }) });

export const getRecommendations = () => apiFetch('/recommendations');