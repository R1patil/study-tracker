const BASE = "https://study-tracker-backend-nbho.onrender.com";

export async function getProgress() {
    const res = await fetch(`${BASE}/progress`, { cache: "no-store" });
    return res.json();
}

export async function getStats() {
    const res = await fetch(`${BASE}/stats`, { cache: "no-store" });
    return res.json();
}

export async function updateStatus(topicId: string, status: string) {
    const res = await fetch(`${BASE}/topic/${topicId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    return res.json();
}

export async function updateNotes(topicId: string, notes: string) {
    const res = await fetch(`${BASE}/topic/${topicId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
    });
    return res.json();
}

export async function controlTimer(action: string, topicId?: string, topicTitle?: string) {
    const res = await fetch(`${BASE}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, topic_id: topicId, topic_title: topicTitle }),
    });
    return res.json();
}

export async function getTimer() {
    const res = await fetch(`${BASE}/timer`, { cache: "no-store" });
    return res.json();
}