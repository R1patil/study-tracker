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
export const chatWithJarvis = (message: string, history: any[]) => 
    apiFetch('/agent/chat', { method: 'POST', body: JSON.stringify({ message, history }) });
export const logGoogleSearch = (query: string, category?: string) => 
    apiFetch('/searches/log', { method: 'POST', body: JSON.stringify({ query, category }) });
export const getActivitySummary = () => apiFetch('/activity/summary');
export const getGithubBranches = (owner: string, repo: string) =>
    apiFetch(`/github/branches?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
export const getGithubStructure = (owner: string, repo: string, branch: string) =>
    apiFetch(`/github/structure?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`);
export const analyzeGithubRepo = (owner: string, repo: string, branch: string, files: any[]) =>
    apiFetch(`/github/analyze`, { method: "POST", body: JSON.stringify({ owner, repo, branch, files }) });
export const getGithubFileContent = (owner: string, repo: string, path: string, ref: string) =>
    apiFetch(`/github/file-content?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}&ref=${encodeURIComponent(ref)}`);
export const getGithubBranchSummary = (owner: string, repo: string, branch: string) =>
    apiFetch(`/github/branch-summary?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`);
export const getProfile = () => apiFetch('/profile');
export const updateProfile = (profile: any) => apiFetch('/profile', { method: 'POST', body: JSON.stringify(profile) });