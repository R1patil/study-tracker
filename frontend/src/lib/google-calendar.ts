import { createClient } from "@/lib/supabase/client";
import { SRTopic, getIntervalLabel } from "@/lib/spaced-repetition";

// ── Check if user signed in with Google ───────────────────────
export async function getGoogleAccessToken(): Promise<string | null> {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) return null;

    // Check if provider is google and token exists
    const providerToken = session.provider_token;
    const identities = session.user?.identities || [];
    const isGoogle = identities.some((i: any) => i.provider === "google");

    if (isGoogle && providerToken) return providerToken;
    return null;
}

// ── Add event via Google Calendar API (Google OAuth users) ────
export async function addToGoogleCalendarAPI(
    topic: SRTopic,
    accessToken: string
): Promise<{ success: boolean; error?: string }> {
    const startDate = topic.nextReview; // YYYY-MM-DD
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const event = {
        summary: `📚 Review: ${topic.title}`,
        description: `Spaced repetition review\n\nTopic: ${topic.title}\nTrack: ${topic.trackTitle}\nReview #${topic.reviewCount + 1} — Interval: ${getIntervalLabel(topic.intervalIndex)}\n\nAdded by Study Tracker App`,
        start: { date: startDate },    // all-day event
        end: { date: endDateStr },
        colorId: "9",                  // blueberry color
        reminders: {
            useDefault: false,
            overrides: [
                { method: "popup", minutes: 60 },  // 1hr before
                { method: "email", minutes: 1440 }, // 1 day before
            ],
        },
    };

    try {
        const res = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(event),
            }
        );

        if (res.status === 401) return { success: false, error: "Google token expired. Please sign out and sign in again." };
        if (!res.ok) {
            const err = await res.json();
            return { success: false, error: err.error?.message || "Failed to add event" };
        }

        return { success: true };
    } catch {
        return { success: false, error: "Network error. Try the manual calendar link instead." };
    }
}

// ── Fallback: open Google Calendar URL (email users) ─────────
export function openGoogleCalendarUrl(topic: SRTopic): void {
    const date = topic.nextReview.replace(/-/g, "");
    const endDate = new Date(topic.nextReview);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = endDate.toISOString().slice(0, 10).replace(/-/g, "");

    const title = encodeURIComponent(`📚 Review: ${topic.title}`);
    const details = encodeURIComponent(
        `Spaced repetition review\n\nTopic: ${topic.title}\nTrack: ${topic.trackTitle}\nReview #${topic.reviewCount + 1} — Interval: ${getIntervalLabel(topic.intervalIndex)}\n\nAdded by Study Tracker App`
    );

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${endDateStr}&details=${details}`;
    window.open(url, "_blank");
}

// ── Smart add: tries API first, falls back to URL ─────────────
export async function smartAddToCalendar(
    topic: SRTopic
): Promise<{ method: "api" | "url"; success: boolean; error?: string }> {
    const token = await getGoogleAccessToken();

    if (token) {
        // Google OAuth user — add silently via API
        const result = await addToGoogleCalendarAPI(topic, token);
        return { method: "api", ...result };
    } else {
        // Email user — open calendar URL
        openGoogleCalendarUrl(topic);
        return { method: "url", success: true };
    }
}