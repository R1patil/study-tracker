"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import {
    loadSRTopics, removeSRTopic, markReviewed, getDueToday,
    getUpcoming, getDaysUntil, getIntervalLabel,
    requestNotificationPermission, SR_INTERVALS, SRTopic,
} from "@/lib/spaced-repetition";

const NOTIF_KEY = "sr_notification_time";

export default function RemindersPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [topics, setTopics] = useState<SRTopic[]>([]);
    const [notifTime, setNotifTime] = useState("09:00");
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [notifPermission, setNotifPermission] = useState<string>("default");
    const [tab, setTab] = useState<"due" | "upcoming" | "all">("due");

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return;
            setUserId(data.user.id);
            setTopics(loadSRTopics(data.user.id));
        });
        if ("Notification" in window) setNotifPermission(Notification.permission);
        const saved = localStorage.getItem(NOTIF_KEY);
        if (saved) {
            const p = JSON.parse(saved);
            setNotifTime(p.time);
            setNotifEnabled(p.enabled);
        }
    }, []);

    const handleMarkReviewed = (topicId: string) => {
        if (!userId) return;
        setTopics(markReviewed(userId, topicId));
    };

    const handleRemove = (topicId: string) => {
        if (!userId) return;
        setTopics(removeSRTopic(userId, topicId));
    };

    const handleEnableNotif = async () => {
        const granted = await requestNotificationPermission();
        setNotifPermission(granted ? "granted" : "denied");
        if (granted) {
            setNotifEnabled(true);
            localStorage.setItem(NOTIF_KEY, JSON.stringify({ time: notifTime, enabled: true }));
            new Notification("📚 Study Tracker", {
                body: `Reminders enabled! You'll be notified at ${notifTime} daily.`,
            });
        }
    };

    const handleSaveTime = () => {
        localStorage.setItem(NOTIF_KEY, JSON.stringify({ time: notifTime, enabled: notifEnabled }));
        if (notifEnabled && notifPermission === "granted") {
            new Notification("📚 Study Tracker", { body: `Reminder time updated to ${notifTime}` });
        }
    };

    const due = getDueToday(topics);
    const upcoming = getUpcoming(topics);
    const all = topics.filter(t => !t.done);
    const displayed = tab === "due" ? due : tab === "upcoming" ? upcoming : all;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px" }}>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontFamily: "monospace", textDecoration: "none", marginBottom: 24 }}>
                ← Back to Dashboard
            </Link>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔔</div>
                    <div>
                        <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 24, color: "var(--text-primary)" }}>Study Reminders</h1>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>Spaced repetition · Never forget what you studied</p>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

                {/* Left — Topic list */}
                <div>
                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                        {[
                            { label: "Due Today", value: due.length, color: due.length > 0 ? "#ef4444" : "#10b981", icon: "🔴" },
                            { label: "Upcoming", value: upcoming.length, color: "#f59e0b", icon: "📅" },
                            { label: "Challenging", value: all.length, color: "#6366f1", icon: "🎯" },
                        ].map(s => (
                            <div key={s.label} style={{ background: "var(--surface)", border: `1px solid ${s.color}22`, borderRadius: 12, padding: "14px 16px" }}>
                                <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.icon} {s.label}</div>
                                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 28, color: s.color, marginTop: 4 }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        {([
                            { key: "due", label: `Due Today (${due.length})` },
                            { key: "upcoming", label: `Upcoming (${upcoming.length})` },
                            { key: "all", label: `All Challenging (${all.length})` },
                        ] as const).map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12, fontFamily: "monospace", cursor: "pointer", background: tab === t.key ? "#6366f1" : "transparent", border: `1px solid ${tab === t.key ? "#6366f1" : "var(--border)"}`, color: tab === t.key ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Topic cards */}
                    {displayed.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>{tab === "due" ? "🎉" : "📚"}</div>
                            <p style={{ color: "var(--text-primary)", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                                {tab === "due" ? "All caught up!" : "No topics here"}
                            </p>
                            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                                {tab === "due" ? "No topics due for review today. Great job! 🚀" : "Mark topics as 🔴 challenging from the dashboard."}
                            </p>
                            {tab !== "due" && (
                                <Link href="/dashboard" style={{ display: "inline-block", marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#6366f1", color: "white", fontSize: 13, textDecoration: "none", fontFamily: "Syne,sans-serif", fontWeight: 600 }}>
                                    Go to Dashboard →
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {displayed.map(topic => {
                                const daysUntil = getDaysUntil(topic.nextReview);
                                const isDue = daysUntil <= 0;

                                return (
                                    <div key={topic.id} style={{ background: "var(--surface)", border: `1px solid ${isDue ? "rgba(239,68,68,0.3)" : "var(--border)"}`, borderRadius: 14, padding: "16px 18px" }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 8px", borderRadius: 20, background: "rgba(99,102,241,0.12)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)", marginBottom: 6, display: "inline-block" }}>
                                                    {topic.trackTitle}
                                                </span>
                                                <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 }}>
                                                    {topic.title}
                                                </p>
                                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                                                    <span style={{ fontSize: 11, fontFamily: "monospace", color: isDue ? "#ef4444" : "#f59e0b" }}>
                                                        {isDue ? `⚠ Due ${daysUntil === 0 ? "today" : `${Math.abs(daysUntil)}d ago`}` : `📅 Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                                                    </span>
                                                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                                        Interval: {getIntervalLabel(topic.intervalIndex)} · Review #{topic.reviewCount + 1}
                                                    </span>
                                                </div>

                                                {/* Interval progress bar */}
                                                <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                                                    {SR_INTERVALS.map((_, i) => (
                                                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= topic.intervalIndex ? "#6366f1" : "var(--muted)", transition: "background 0.3s" }} />
                                                    ))}
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                                                    {SR_INTERVALS.map((d, i) => (
                                                        <span key={i} style={{ fontSize: 9, fontFamily: "monospace", color: i <= topic.intervalIndex ? "#6366f1" : "var(--text-secondary)" }}>d{d}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                                                <button onClick={() => handleMarkReviewed(topic.id)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", fontSize: 11, fontFamily: "Syne,sans-serif", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                                                    ✓ Reviewed
                                                </button>
                                                <AddToCalendarButton topic={topic} />
                                                <button onClick={() => handleRemove(topic.id)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "transparent", color: "#f87171", fontSize: 11, fontFamily: "monospace", cursor: "pointer", whiteSpace: "nowrap" }}>
                                                    🗑 Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right — Notification settings */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                        <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>🔔 Browser Notifications</h3>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>Get reminded daily about topics due for review.</p>

                        <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 14, background: notifPermission === "granted" ? "rgba(16,185,129,0.1)" : notifPermission === "denied" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${notifPermission === "granted" ? "rgba(16,185,129,0.3)" : notifPermission === "denied" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}` }}>
                            <p style={{ fontSize: 11, fontFamily: "monospace", color: notifPermission === "granted" ? "#10b981" : notifPermission === "denied" ? "#f87171" : "#f59e0b" }}>
                                {notifPermission === "granted" ? "✅ Notifications allowed" : notifPermission === "denied" ? "❌ Blocked — enable in browser settings" : "⚠ Not enabled yet"}
                            </p>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>REMINDER TIME</label>
                            <input type="time" value={notifTime} onChange={e => setNotifTime(e.target.value)}
                                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, fontFamily: "monospace", outline: "none" }}
                            />
                        </div>

                        {notifPermission !== "granted" ? (
                            <button onClick={handleEnableNotif} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "white", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                                Enable Notifications
                            </button>
                        ) : (
                            <button onClick={handleSaveTime} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                                Save Reminder Time
                            </button>
                        )}
                    </div>

                    {/* How it works */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                        <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 12 }}>📖 How It Works</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                                { day: "Day 1", desc: "Review next day", color: "#ef4444" },
                                { day: "Day 3", desc: "Review after 3 days", color: "#f59e0b" },
                                { day: "Day 7", desc: "Review after 1 week", color: "#3b82f6" },
                                { day: "Day 14", desc: "Review after 2 weeks", color: "#8b5cf6" },
                                { day: "Day 30", desc: "Review after 1 month", color: "#10b981" },
                            ].map(s => (
                                <div key={s.day} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 42, padding: "2px 0", textAlign: "center", borderRadius: 6, background: `${s.color}22`, border: `1px solid ${s.color}44`, fontSize: 10, fontFamily: "monospace", color: s.color, fontWeight: 600, flexShrink: 0 }}>{s.day}</div>
                                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.desc}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(99,102,241,0.08)", borderRadius: 8, border: "1px solid rgba(99,102,241,0.2)" }}>
                            <p style={{ fontSize: 11, fontFamily: "monospace", color: "#6366f1", lineHeight: 1.6 }}>
                                📅 <strong>Google OAuth users</strong> — event added directly to your calendar silently!<br />
                                📧 <strong>Email users</strong> — calendar opens pre-filled, just click Save.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}