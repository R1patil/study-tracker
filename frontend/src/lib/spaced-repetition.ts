// ── Spaced Repetition Engine ─────────────────────────────────
// Intervals: 1 → 3 → 7 → 14 → 30 days
export const SR_INTERVALS = [1, 3, 7, 14, 30];

export interface SRTopic {
    id: string;
    title: string;
    trackTitle: string;
    markedAt: string;       // ISO date when marked challenging
    lastReviewed: string | null;
    nextReview: string;     // ISO date
    intervalIndex: number;  // 0-4 (which interval we're on)
    reviewCount: number;
    done: boolean;
}

export function getStorageKey(userId: string) {
    return `sr_topics_${userId}`;
}

export function loadSRTopics(userId: string): SRTopic[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(getStorageKey(userId));
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveSRTopics(userId: string, topics: SRTopic[]) {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(topics));
}

export function addSRTopic(userId: string, topic: { id: string; title: string; trackTitle: string }): SRTopic[] {
    const topics = loadSRTopics(userId);
    if (topics.find(t => t.id === topic.id)) return topics; // already exists

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + SR_INTERVALS[0]);

    const newTopic: SRTopic = {
        ...topic,
        markedAt: new Date().toISOString(),
        lastReviewed: null,
        nextReview: tomorrow.toISOString().slice(0, 10),
        intervalIndex: 0,
        reviewCount: 0,
        done: false,
    };

    const updated = [newTopic, ...topics];
    saveSRTopics(userId, updated);
    return updated;
}

export function removeSRTopic(userId: string, topicId: string): SRTopic[] {
    const updated = loadSRTopics(userId).filter(t => t.id !== topicId);
    saveSRTopics(userId, updated);
    return updated;
}

export function markReviewed(userId: string, topicId: string): SRTopic[] {
    const topics = loadSRTopics(userId);
    const updated = topics.map(t => {
        if (t.id !== topicId) return t;
        const nextIdx = Math.min(t.intervalIndex + 1, SR_INTERVALS.length - 1);
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + SR_INTERVALS[nextIdx]);
        return {
            ...t,
            lastReviewed: new Date().toISOString().slice(0, 10),
            nextReview: nextDate.toISOString().slice(0, 10),
            intervalIndex: nextIdx,
            reviewCount: t.reviewCount + 1,
        };
    });
    saveSRTopics(userId, updated);
    return updated;
}

export function getDueToday(topics: SRTopic[]): SRTopic[] {
    const today = new Date().toISOString().slice(0, 10);
    return topics.filter(t => !t.done && t.nextReview <= today);
}

export function getUpcoming(topics: SRTopic[]): SRTopic[] {
    const today = new Date().toISOString().slice(0, 10);
    return topics.filter(t => !t.done && t.nextReview > today)
        .sort((a, b) => a.nextReview.localeCompare(b.nextReview));
}

export function getDaysUntil(dateStr: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function getIntervalLabel(idx: number): string {
    const labels = ["Day 1", "Day 3", "Day 7", "Day 14", "Day 30"];
    return labels[idx] || "Day 30";
}

// ── Google Calendar URL generator ────────────────────────────
export function buildGCalUrl(topic: SRTopic): string {
    const date = topic.nextReview.replace(/-/g, "");
    const title = encodeURIComponent(`📚 Review: ${topic.title}`);
    const details = encodeURIComponent(
        `Spaced repetition review for: ${topic.title}\nTrack: ${topic.trackTitle}\nReview #${topic.reviewCount + 1} — Interval: ${getIntervalLabel(topic.intervalIndex)}\n\nStudy Tracker App`
    );
    // All-day event
    const nextDay = new Date(topic.nextReview);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = nextDay.toISOString().slice(0, 10).replace(/-/g, "");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${endDate}&details=${details}`;
}

// ── Notification helpers ──────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const result = await Notification.requestPermission();
    return result === "granted";
}

export function scheduleNotification(title: string, body: string, delayMs: number) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    setTimeout(() => {
        new Notification(title, {
            body,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
        });
    }, delayMs);
}