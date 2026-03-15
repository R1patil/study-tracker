"use client";
import { useState } from "react";
import { updateStatus, updateNotes, controlTimer } from "@/lib/api";

const STATUS_CYCLE: Record<string, string> = {
    not_started: "in_progress",
    in_progress: "done",
    done: "not_started",
};
const STATUS_LABELS: Record<string, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    done: "Done",
};
const STATUS_COLORS: Record<string, string> = {
    not_started: "var(--muted)",
    in_progress: "#f59e0b",
    done: "#10b981",
};
const DIFF_COLORS: Record<string, string> = {
    easy: "#10b981",
    medium: "#f59e0b",
    hard: "#ef4444",
};

export default function TopicCard({ topic, trackColor, onUpdate, delay = 0 }: { topic: any; trackColor: string; onUpdate: () => void; delay?: number }) {
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState(topic.notes || "");
    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [timerOn, setTimerOn] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleStatus = async () => {
        setUpdatingStatus(true);
        await updateStatus(topic.id, STATUS_CYCLE[topic.status]);
        onUpdate();
        setUpdatingStatus(false);
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        await updateNotes(topic.id, notes);
        setSaving(false);
        setShowNotes(false);
        onUpdate();
    };

    const handleTimer = async () => {
        if (timerOn) {
            await controlTimer("stop");
            setTimerOn(false);
            onUpdate();
        } else {
            await controlTimer("start", topic.id, topic.title);
            setTimerOn(true);
        }
    };

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: "12px 20px",
                background: hovered ? "var(--surface2)" : "var(--surface)",
                borderLeft: `2px solid ${hovered ? trackColor : "transparent"}`,
                transition: "all 0.15s ease",
                animationDelay: `${delay}ms`,
                animationFillMode: "both",
                opacity: 0,
            }}
            className="fade-up"
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Status dot */}
                <button onClick={handleStatus} disabled={updatingStatus} title={`→ ${STATUS_LABELS[STATUS_CYCLE[topic.status]]}`}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                    <div style={{
                        width: 9, height: 9, borderRadius: "50%",
                        background: STATUS_COLORS[topic.status],
                        boxShadow: topic.status === "done" ? "0 0 6px rgba(16,185,129,0.5)" : topic.status === "in_progress" ? "0 0 6px rgba(245,158,11,0.5)" : "none",
                        transition: "all 0.2s",
                    }} />
                </button>

                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <a href={topic.url} target="_blank" rel="noopener noreferrer" style={{
                            fontSize: 13, color: topic.status === "done" ? "var(--text-secondary)" : "var(--text-primary)",
                            textDecoration: topic.status === "done" ? "line-through" : "none",
                            fontFamily: "DM Sans, sans-serif",
                        }}
                            onMouseEnter={e => { if (topic.status !== "done") (e.target as HTMLElement).style.color = trackColor; }}
                            onMouseLeave={e => { (e.target as HTMLElement).style.color = topic.status === "done" ? "var(--text-secondary)" : "var(--text-primary)"; }}
                        >
                            {topic.title}
                        </a>
                        {topic.difficulty && (
                            <span style={{
                                fontSize: 9, fontFamily: "monospace", padding: "2px 7px", borderRadius: 20,
                                color: DIFF_COLORS[topic.difficulty],
                                border: `1px solid ${DIFF_COLORS[topic.difficulty]}44`,
                                background: `${DIFF_COLORS[topic.difficulty]}11`,
                            }}>{topic.difficulty}</span>
                        )}
                        {notes && <span style={{ fontSize: 11 }}>📝</span>}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {/* Status btn */}
                    <button onClick={handleStatus} style={{
                        padding: "3px 10px", borderRadius: 6, fontSize: 10, fontFamily: "monospace", cursor: "pointer",
                        background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", transition: "all 0.15s",
                    }}
                        onMouseEnter={e => { (e.currentTarget.style.borderColor = trackColor); (e.currentTarget.style.color = trackColor); }}
                        onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}
                    >
                        {STATUS_LABELS[topic.status]}
                    </button>

                    {/* Timer btn */}
                    <button onClick={handleTimer} title={timerOn ? "Stop timer" : "Start timer"} style={{
                        padding: "3px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                        background: timerOn ? "rgba(239,68,68,0.1)" : "transparent",
                        border: timerOn ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--border)",
                        color: timerOn ? "#f87171" : "var(--text-secondary)", transition: "all 0.15s",
                    }}
                        className={timerOn ? "timer-blink" : ""}
                    >{timerOn ? "⏹" : "⏱"}</button>

                    {/* Notes btn */}
                    <button onClick={() => setShowNotes(!showNotes)} title="Notes" style={{
                        padding: "3px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                        background: showNotes ? `${trackColor}18` : "transparent",
                        border: showNotes ? `1px solid ${trackColor}55` : "1px solid var(--border)",
                        color: showNotes ? trackColor : "var(--text-secondary)", transition: "all 0.15s",
                    }}>📝</button>
                </div>
            </div>

            {/* Notes panel */}
            {showNotes && (
                <div style={{ marginTop: 10, marginLeft: 21 }} className="fade-up">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes, key takeaways, or questions..."
                        rows={3}
                        style={{
                            width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
                            borderRadius: 8, padding: "10px 12px", fontSize: 12, fontFamily: "JetBrains Mono, monospace",
                            color: "var(--text-primary)", resize: "none", outline: "none", transition: "border-color 0.2s",
                        }}
                        onFocus={e => (e.target.style.borderColor = trackColor)}
                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <button onClick={handleSaveNotes} disabled={saving} style={{
                            padding: "5px 14px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", cursor: "pointer",
                            background: trackColor, border: "none", color: "white", opacity: saving ? 0.7 : 1,
                        }}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setShowNotes(false)} style={{
                            padding: "5px 14px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", cursor: "pointer",
                            background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)",
                        }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}