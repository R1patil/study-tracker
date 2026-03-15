"use client";
import { useEffect, useState } from "react";
import { controlTimer, getTimer } from "@/lib/api";

export default function TimerWidget({ onSessionEnd }: { onSessionEnd: () => void }) {
    const [activeTimer, setActiveTimer] = useState<any>(null);
    const [elapsed, setElapsed] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getTimer().then((d) => {
            if (d.active_timer) {
                setActiveTimer(d.active_timer);
                setElapsed(Math.floor((Date.now() - new Date(d.active_timer.started_at).getTime()) / 1000));
            }
        });
    }, []);

    useEffect(() => {
        if (!activeTimer) return;
        const id = setInterval(() => {
            setElapsed(Math.floor((Date.now() - new Date(activeTimer.started_at).getTime()) / 1000));
        }, 1000);
        return () => clearInterval(id);
    }, [activeTimer]);

    const fmt = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
            : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const handleStart = async () => {
        setLoading(true);
        const res = await controlTimer("start", undefined, "General Study");
        setActiveTimer(res.timer);
        setElapsed(0);
        setLoading(false);
    };

    const handleStop = async () => {
        setLoading(true);
        await controlTimer("stop");
        setActiveTimer(null);
        setElapsed(0);
        onSessionEnd();
        setLoading(false);
    };

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 16,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 20px",
        }}>
            {/* Indicator dot */}
            <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: activeTimer ? "#10b981" : "var(--muted)",
                boxShadow: activeTimer ? "0 0 8px rgba(16,185,129,0.6)" : "none",
            }}
                className={activeTimer ? "timer-blink" : ""}
            />

            <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Study Timer
            </span>

            {activeTimer && (
                <>
                    <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>—</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {activeTimer.topic_title || "General Study"}
                    </span>
                </>
            )}

            <div style={{ flex: 1 }} />

            {activeTimer && (
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 500, color: "#10b981" }}>
                    {fmt(elapsed)}
                </span>
            )}

            <button
                onClick={activeTimer ? handleStop : handleStart}
                disabled={loading}
                style={{
                    padding: "8px 18px", borderRadius: 8, fontSize: 12,
                    fontFamily: "Syne, sans-serif", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s",
                    background: activeTimer ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                    border: activeTimer ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(16,185,129,0.35)",
                    color: activeTimer ? "#f87171" : "#10b981",
                }}
            >
                {loading ? "..." : activeTimer ? "⏹ Stop Session" : "▶ Start Session"}
            </button>
        </div>
    );
}