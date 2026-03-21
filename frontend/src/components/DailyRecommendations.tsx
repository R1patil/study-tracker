"use client";
import { useState } from "react";
//import { getRecommendations } from "@/lib/api";
import { getRecommendations } from "@/lib/api";
import { loadSRTopics, getDueToday } from "@/lib/spaced-repetition";
import { createClient } from "@/lib/supabase/client";

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";

interface Recommendation {
    emoji: string;
    type: string;
    topic: string;
    track: string;
    reason: string;
    action: string;
    priority: "high" | "medium" | "low";
}

interface AIResponse {
    greeting: string;
    summary: string;
    recommendations: Recommendation[];
    motivation: string;
}

function buildPrompt(activityData: any, dueTopics: any[], userName: string): string {
    const {
        today, streak, track_stats, in_progress_topics,
        recently_done, not_started_by_track,
        daily_study_time, most_studied_topics, total_study_mins,
    } = activityData;

    // Format track progress
    const trackSummary = Object.entries(track_stats)
        .map(([, t]: [string, any]) => `  - ${t.title}: ${t.done}/${t.total} topics done (${t.percent}%)`)
        .join("\n");

    // Format in-progress
    const inProgressStr = in_progress_topics.length > 0
        ? in_progress_topics.map((t: any) => `  - "${t.title}" (${t.track} → ${t.section})`).join("\n")
        : "  - None";

    // Format spaced repetition due today
    const dueStr = dueTopics.length > 0
        ? dueTopics.map(t => `  - "${t.title}" (${t.trackTitle}) — Review #${t.reviewCount + 1}`).join("\n")
        : "  - None due today";

    // Format recently done
    const recentDoneStr = recently_done.length > 0
        ? recently_done.map((t: any) => `  - "${t.title}" (${t.track})`).join("\n")
        : "  - None yet";

    // Format study time this week
    const weeklyMins = Object.values(daily_study_time as Record<string, number>).reduce((a, b) => a + b, 0);

    return `You are a smart study coach for an Indian tech student preparing for software engineering interviews.

Student: ${userName}
Today: ${today}
Current streak: ${streak.current} days (best: ${streak.longest} days)
Total study time: ${Math.round(total_study_mins)} minutes overall
Study time this week: ${Math.round(weeklyMins)} minutes

PROGRESS PER TRACK:
${trackSummary}

CURRENTLY IN PROGRESS:
${inProgressStr}

SPACED REPETITION DUE TODAY:
${dueStr}

RECENTLY COMPLETED:
${recentDoneStr}

MOST STUDIED TOPICS:
${most_studied_topics.map(([t, m]: [string, number]) => `  - ${t}: ${Math.round(m)} mins`).join("\n") || "  - None yet"}

NEXT TOPICS NOT STARTED (first 5 per track):
${Object.entries(not_started_by_track).map(([track, topics]: [string, any]) =>
        `  ${track}: ${(topics as any[]).slice(0, 3).map((t: any) => t.title).join(", ")}`
    ).join("\n")}

Based on this data, generate exactly 3 personalized study recommendations for today.

Return ONLY this JSON (no markdown, no backticks):
{
  "greeting": "Short personalized greeting using their name and streak if > 0",
  "summary": "1 sentence summary of their overall progress and momentum",
  "recommendations": [
    {
      "emoji": "single emoji",
      "type": "Focus|Review|Complete|Start|Revisit",
      "topic": "exact topic name",
      "track": "track name",
      "reason": "specific reason based on their data (mention days/progress/streak)",
      "action": "specific action to take today (concrete and short)",
      "priority": "high|medium|low"
    }
  ],
  "motivation": "1 short motivational line relevant to Indian tech job market"
}

Rules:
- Priority 1: spaced repetition topics due today (mark as Review)
- Priority 2: topics currently in_progress (mark as Focus or Complete)
- Priority 3: logical next topics not started based on track progress
- Be specific — mention actual topic names and track names from the data
- Reasons must reference actual numbers/data, not generic advice
- Keep each field concise (under 15 words)`;
}

export default function DailyRecommendations() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AIResponse | null>(null);
    const [error, setError] = useState("");
    const [lastFetched, setLastFetched] = useState<string | null>(null);
    const supabase = createClient();

    const handleOpen = async () => {
        setOpen(true);
        // Don't re-fetch if already loaded today
        const today = new Date().toISOString().slice(0, 10);
        if (lastFetched === today && data) return;

        setLoading(true);
        setError("");

        try {
            // Get user info
            const { data: userData } = await supabase.auth.getUser();
            const userName = userData.user?.user_metadata?.full_name ||
                userData.user?.email?.split("@")[0] || "there";
            const userId = userData.user?.id || "";

            // Fetch activity data from backend
            const activityData = await getRecommendations();

            // Get spaced repetition due today from localStorage
            const srTopics = userId ? loadSRTopics(userId) : [];
            const dueToday = getDueToday(srTopics);

            // Build prompt and call Groq
            const prompt = buildPrompt(activityData, dueToday, userName);

            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    max_tokens: 800,
                    temperature: 0.4,
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            if (res.status === 429) {
                setError("Daily AI limit reached. Come back tomorrow!");
                setLoading(false);
                return;
            }
            if (!res.ok) throw new Error("Groq API error");

            const groqData = await res.json();
            let text = groqData.choices?.[0]?.message?.content || "";

            // Clean JSON
            text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
            const first = text.indexOf("{");
            const last = text.lastIndexOf("}");
            if (first !== -1 && last !== -1) text = text.slice(first, last + 1);

            const parsed: AIResponse = JSON.parse(text);
            setData(parsed);
            setLastFetched(today);
        } catch {
            setError("Could not generate recommendations. Please try again.");
        }
        setLoading(false);
    };

    const priorityColor = (p: string) =>
        p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#10b981";

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={handleOpen}
                style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "14px 20px", borderRadius: 14,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08))",
                    border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer",
                    transition: "all 0.2s", textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#6366f1")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)")}
            >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    🧠
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                        What should I study today?
                    </div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", marginTop: 2 }}>
                        AI analyses your progress and gives 3 personalized recommendations
                    </div>
                </div>
                <span style={{ fontSize: 12, color: "#6366f1", fontFamily: "monospace" }}>Ask AI →</span>
            </button>

            {/* Panel overlay */}
            {open && (
                <>
                    <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, backdropFilter: "blur(2px)" }} />

                    <div style={{
                        position: "fixed", right: 0, top: 0, height: "100vh", width: 440,
                        background: "var(--surface)", borderLeft: "1px solid var(--border)",
                        zIndex: 101, display: "flex", flexDirection: "column",
                        animation: "slideIn 0.25s ease",
                        boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
                    }}>
                        {/* Header */}
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
                                <div>
                                    <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Daily Study Plan</h2>
                                    <p style={{ fontSize: 10, fontFamily: "monospace", color: "#10b981" }}>● Personalized · Based on your activity</p>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 18, padding: "2px 6px" }}>✕</button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

                            {/* Loading state */}
                            {loading && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", paddingTop: 40 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                                    <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>Analysing your progress...</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 8 }}>
                                        {["Checking in-progress topics", "Reading study sessions", "Checking spaced repetition", "Generating recommendations"].map((s, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)" }}>
                                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />
                                                <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error state */}
                            {error && !loading && (
                                <div style={{ padding: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, textAlign: "center" }}>
                                    <p style={{ fontSize: 13, color: "#f87171", fontFamily: "monospace", marginBottom: 12 }}>⚠ {error}</p>
                                    <button onClick={handleOpen} style={{ padding: "7px 18px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.1)", color: "#6366f1", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* Results */}
                            {data && !loading && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    {/* Greeting */}
                                    <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.08))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "16px 18px" }}>
                                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>
                                            {data.greeting}
                                        </p>
                                        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontFamily: "DM Sans,sans-serif" }}>
                                            {data.summary}
                                        </p>
                                    </div>

                                    {/* Recommendations */}
                                    <div>
                                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                                            📋 Today&apos;s Plan
                                        </p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {data.recommendations.map((rec, i) => (
                                                <div key={i} style={{ background: "var(--bg)", border: `1px solid ${priorityColor(rec.priority)}33`, borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                                                    {/* Priority indicator */}
                                                    <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: priorityColor(rec.priority), borderRadius: "2px 0 0 2px" }} />

                                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                                        <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{rec.emoji}</span>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            {/* Type badge + topic */}
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                                                <span style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 8px", borderRadius: 20, background: `${priorityColor(rec.priority)}18`, color: priorityColor(rec.priority), border: `1px solid ${priorityColor(rec.priority)}44`, fontWeight: 600 }}>
                                                                    {rec.type}
                                                                </span>
                                                                <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                                                    {rec.track}
                                                                </span>
                                                            </div>

                                                            <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 }}>
                                                                {rec.topic}
                                                            </p>

                                                            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8, fontFamily: "DM Sans,sans-serif" }}>
                                                                {rec.reason}
                                                            </p>

                                                            {/* Action */}
                                                            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                                                                <span style={{ fontSize: 11 }}>→</span>
                                                                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#6366f1" }}>{rec.action}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Motivation */}
                                    <div style={{ textAlign: "center", padding: "16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12 }}>
                                        <p style={{ fontSize: 13, color: "#f59e0b", fontFamily: "Syne,sans-serif", fontWeight: 600, lineHeight: 1.6 }}>
                                            💪 {data.motivation}
                                        </p>
                                    </div>

                                    {/* Date stamp */}
                                    <p style={{ textAlign: "center", fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                        Generated on {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })} · Powered by Groq
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                ⚡ Groq · Llama 3.3 70B · Free
                            </span>
                            {data && !loading && (
                                <button
                                    onClick={() => { setData(null); setLastFetched(null); handleOpen(); }}
                                    style={{ padding: "5px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 11, fontFamily: "monospace", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseEnter={e => { (e.currentTarget.style.borderColor = "#6366f1"); (e.currentTarget.style.color = "#6366f1"); }}
                                    onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}
                                >
                                    🔄 Refresh
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
        </>
    );
}