"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loadSRTopics, getDueToday, markReviewed, SRTopic } from "@/lib/spaced-repetition";
import AddToCalendarButton from "@/components/AddToCalendarButton";

export default function ReviewToday() {
    const [due, setDue] = useState<SRTopic[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return;
            setUserId(data.user.id);
            setDue(getDueToday(loadSRTopics(data.user.id)));
        });
    }, []);

    if (due.length === 0) return null;

    const handleReviewed = (topicId: string) => {
        if (!userId) return;
        markReviewed(userId, topicId);
        setDue(prev => prev.filter(t => t.id !== topicId));
    };

    return (
        <div style={{ background: "var(--surface)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, overflow: "hidden" }}>
            {/* Header */}
            <button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.6)", animation: "pulse 1.5s ease-in-out infinite" }} />
                    <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Review Today</span>
                    <span style={{ fontSize: 11, fontFamily: "monospace", padding: "2px 8px", borderRadius: 20, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                        {due.length} topic{due.length !== 1 ? "s" : ""} due
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link href="/reminders" onClick={e => e.stopPropagation()} style={{ fontSize: 11, fontFamily: "monospace", color: "#6366f1", textDecoration: "none" }}>
                        View all →
                    </Link>
                    <span style={{ color: "var(--text-secondary)", fontSize: 12, display: "inline-block", transition: "transform 0.2s", transform: collapsed ? "rotate(180deg)" : "none" }}>▾</span>
                </div>
            </button>

            {/* Topics */}
            {!collapsed && (
                <div style={{ borderTop: "1px solid rgba(239,68,68,0.15)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {due.map(topic => (
                        <div key={topic.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontFamily: "Syne,sans-serif", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{topic.title}</p>
                                <p style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                    {topic.trackTitle} · Review #{topic.reviewCount + 1}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
                                {/* Smart calendar button */}
                                <AddToCalendarButton topic={topic} size="small" />
                                {/* Mark done */}
                                <button onClick={() => handleReviewed(topic.id)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", fontSize: 11, fontFamily: "Syne,sans-serif", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                                    ✓ Done
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}