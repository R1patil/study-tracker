"use client";
import { useState } from "react";
import TopicCard from "./TopicCard";

const TC: Record<string, string> = {
    system_design: "#6366f1",
    machine_learning: "#10b981",
    mlops: "#f59e0b",
};

type Filter = "all" | "not_started" | "in_progress" | "done";

export default function TrackView({ trackKey, track, stats, onUpdate }: { trackKey: string; track: any; stats: any; onUpdate: () => void }) {
    const [openSection, setOpenSection] = useState<string | null>(Object.keys(track.sections)[0]);
    const [filter, setFilter] = useState<Filter>("all");

    if (!track) return null;
    const color = TC[trackKey] || "#6366f1";

    const filters: { key: Filter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "not_started", label: "Not Started" },
        { key: "in_progress", label: "In Progress" },
        { key: "done", label: "Done" },
    ];

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Track header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 32 }}>{track.icon}</span>
                    <div>
                        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>
                            {track.title}
                        </h2>
                        <a href={track.source} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", textDecoration: "none" }}>
                            {track.source} ↗
                        </a>
                    </div>
                </div>
                {stats && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontFamily: "monospace" }}>
                        <span style={{ color, fontWeight: 600 }}>{stats.percent}%</span>
                        <span style={{ color: "var(--text-secondary)" }}>complete</span>
                        <span style={{ color: "var(--border)" }}>·</span>
                        <span style={{ color: "#10b981" }}>{stats.done} done</span>
                        <span style={{ color: "var(--border)" }}>·</span>
                        <span style={{ color: "#f59e0b" }}>{stats.in_progress} in progress</span>
                    </div>
                )}
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 8 }}>
                {filters.map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: "5px 14px", borderRadius: 20, fontSize: 11, fontFamily: "monospace",
                        cursor: "pointer", transition: "all 0.2s",
                        background: filter === f.key ? color : "transparent",
                        border: `1px solid ${filter === f.key ? color : "var(--border)"}`,
                        color: filter === f.key ? "white" : "var(--text-secondary)",
                    }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(track.sections).map(([sKey, section]: [string, any]) => {
                    const filtered = section.topics.filter((t: any) => filter === "all" || t.status === filter);
                    if (filtered.length === 0 && filter !== "all") return null;

                    const done = section.topics.filter((t: any) => t.status === "done").length;
                    const total = section.topics.length;
                    const isOpen = openSection === sKey;

                    return (
                        <div key={sKey} style={{
                            borderRadius: 12, border: "1px solid var(--border)",
                            background: "var(--surface)", overflow: "hidden",
                        }}>
                            {/* Section header */}
                            <button onClick={() => setOpenSection(isOpen ? null : sKey)} style={{
                                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer",
                                transition: "background 0.2s",
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 3, height: 20, borderRadius: 2, background: isOpen ? color : "var(--muted)", transition: "background 0.2s" }} />
                                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                                        {section.title}
                                    </span>
                                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                        {done}/{total}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 80, height: 3, background: "var(--muted)", borderRadius: 2, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${total > 0 ? (done / total) * 100 : 0}%`, background: color, borderRadius: 2 }} />
                                    </div>
                                    <span style={{ color: "var(--text-secondary)", fontSize: 12, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                                </div>
                            </button>

                            {/* Topics */}
                            {isOpen && (
                                <div style={{ borderTop: "1px solid var(--border)" }}>
                                    {filtered.length === 0 ? (
                                        <p style={{ textAlign: "center", fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", padding: "20px" }}>
                                            No topics match this filter
                                        </p>
                                    ) : (
                                        filtered.map((topic: any, i: number) => (
                                            <TopicCard key={topic.id} topic={topic} trackColor={color} onUpdate={onUpdate} delay={i * 25} />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}