"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const CHANNEL_URL = "https://www.youtube.com/@R-B107";

// ── Types ────────────────────────────────────────────────────
interface YTVideo {
    id: string;
    title: string;
    url: string;
    category: string;
    watched: boolean;
    notes: string;
    addedAt: string;
}

const CATEGORIES = [
    "System Design",
    "Machine Learning",
    "MLOps",
    "DSA / Coding",
    "Backend / FastAPI",
    "Other",
];

const CAT_COLORS: Record<string, string> = {
    "System Design": "#6366f1",
    "Machine Learning": "#10b981",
    "MLOps": "#f59e0b",
    "DSA / Coding": "#3b82f6",
    "Backend / FastAPI": "#8b5cf6",
    "Other": "#8888aa",
};

// ── Extract YouTube video ID from URL ─────────────────────────
function getYouTubeId(url: string): string | null {
    const patterns = [
        /(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

// ── Storage key per user ──────────────────────────────────────
function storageKey(userId: string) {
    return `yt_challenges_${userId}`;
}

export default function YouTubePage() {
    const [videos, setVideos] = useState<YTVideo[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [filter, setFilter] = useState<string>("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");

    // Add form state
    const [newUrl, setNewUrl] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newCat, setNewCat] = useState(CATEGORIES[0]);
    const [urlError, setUrlError] = useState("");

    const supabase = createClient();

    // Load user + videos from localStorage
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return;
            setUserId(data.user.id);
            const stored = localStorage.getItem(storageKey(data.user.id));
            if (stored) setVideos(JSON.parse(stored));
        });
    }, []);

    const save = (updated: YTVideo[], uid: string) => {
        setVideos(updated);
        localStorage.setItem(storageKey(uid), JSON.stringify(updated));
    };

    const handleAdd = () => {
        setUrlError("");
        if (!newUrl.trim()) { setUrlError("Please enter a YouTube URL"); return; }

        const vid = getYouTubeId(newUrl);
        if (!vid) { setUrlError("Invalid YouTube URL — use a youtube.com/watch or youtu.be link"); return; }
        if (!newTitle.trim()) { setUrlError("Please enter a title"); return; }
        if (!userId) return;

        const entry: YTVideo = {
            id: vid,
            title: newTitle.trim(),
            url: newUrl.trim(),
            category: newCat,
            watched: false,
            notes: "",
            addedAt: new Date().toISOString(),
        };

        const updated = [entry, ...videos.filter(v => v.id !== vid)];
        save(updated, userId);
        setNewUrl(""); setNewTitle(""); setNewCat(CATEGORIES[0]);
        setShowAdd(false);
    };

    const toggleWatched = (id: string) => {
        if (!userId) return;
        save(videos.map(v => v.id === id ? { ...v, watched: !v.watched } : v), userId);
    };

    const saveNote = (id: string) => {
        if (!userId) return;
        save(videos.map(v => v.id === id ? { ...v, notes: noteText } : v), userId);
        setEditingNote(null);
    };

    const deleteVideo = (id: string) => {
        if (!userId) return;
        save(videos.filter(v => v.id !== id), userId);
    };

    const filtered = filter === "All" ? videos : filter === "Watched"
        ? videos.filter(v => v.watched)
        : filter === "Unwatched"
            ? videos.filter(v => !v.watched)
            : videos.filter(v => v.category === filter);

    const watched = videos.filter(v => v.watched).length;
    const total = videos.length;
    const pct = total > 0 ? Math.round((watched / total) * 100) : 0;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px" }}>

            {/* Back link */}
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontFamily: "monospace", textDecoration: "none", marginBottom: 24 }}>
                ← Back to Dashboard
            </Link>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #ff0000, #cc0000)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                            ▶
                        </div>
                        <div>
                            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: "var(--text-primary)" }}>
                                YouTube Challenges
                            </h1>
                            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: 12, fontFamily: "monospace", color: "#ff4444", textDecoration: "none" }}>
                                {CHANNEL_URL} ↗
                            </a>
                        </div>
                    </div>
                </div>

                <button onClick={() => setShowAdd(!showAdd)} style={{
                    padding: "10px 20px", borderRadius: 10, border: "none",
                    background: showAdd ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg, #ff0000, #cc0000)",
                    color: showAdd ? "#f87171" : "white",
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    border: showAdd ? "1px solid rgba(239,68,68,0.3)" : "none",
                } as React.CSSProperties}>
                    {showAdd ? "✕ Cancel" : "+ Add Video"}
                </button>
            </div>

            {/* Stats bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
                {[
                    { label: "Total Videos", value: total, color: "#6366f1" },
                    { label: "Watched", value: watched, color: "#10b981" },
                    { label: "Progress", value: `${pct}%`, color: "#f59e0b" },
                ].map(s => (
                    <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 24, color: s.color, marginTop: 4 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            {total > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <div style={{ height: 4, background: "var(--muted)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #10b981, #6366f1)", borderRadius: 2, transition: "width 0.5s ease" }} />
                    </div>
                    <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", marginTop: 6 }}>
                        {watched} of {total} videos watched
                    </p>
                </div>
            )}

            {/* Add video form */}
            {showAdd && (
                <div style={{ background: "var(--surface)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: 16, padding: 24, marginBottom: 28 }}>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 20 }}>
                        Add a Video from Your Channel
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>YouTube URL *</label>
                            <input
                                value={newUrl} onChange={e => setNewUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 13, fontFamily: "monospace", outline: "none" }}
                                onFocus={e => e.target.style.borderColor = "#ff4444"}
                                onBlur={e => e.target.style.borderColor = "var(--border)"}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Video Title *</label>
                            <input
                                value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                placeholder="e.g. System Design - URL Shortener"
                                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }}
                                onFocus={e => e.target.style.borderColor = "#ff4444"}
                                onBlur={e => e.target.style.borderColor = "var(--border)"}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Category</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {CATEGORIES.map(cat => (
                                    <button key={cat} onClick={() => setNewCat(cat)} style={{
                                        padding: "5px 14px", borderRadius: 20, fontSize: 12, fontFamily: "monospace", cursor: "pointer",
                                        background: newCat === cat ? CAT_COLORS[cat] : "transparent",
                                        border: `1px solid ${newCat === cat ? CAT_COLORS[cat] : "var(--border)"}`,
                                        color: newCat === cat ? "white" : "var(--text-secondary)",
                                    }}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {urlError && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#f87171", fontFamily: "monospace" }}>⚠ {urlError}</div>}
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={handleAdd} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#ff0000", color: "white", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                                Add Video
                            </button>
                            <button onClick={() => setShowAdd(false)} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12, cursor: "pointer" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {["All", "Watched", "Unwatched", ...CATEGORIES].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: "5px 14px", borderRadius: 20, fontSize: 11, fontFamily: "monospace", cursor: "pointer",
                        background: filter === f ? (CAT_COLORS[f] || "#6366f1") : "transparent",
                        border: `1px solid ${filter === f ? (CAT_COLORS[f] || "#6366f1") : "var(--border)"}`,
                        color: filter === f ? "white" : "var(--text-secondary)",
                    }}>
                        {f} {f === "All" ? `(${total})` : f === "Watched" ? `(${watched})` : f === "Unwatched" ? `(${total - watched})` : ""}
                    </button>
                ))}
            </div>

            {/* Video grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                    <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 14 }}>
                        {total === 0 ? "No videos yet — add your first challenge video!" : "No videos match this filter"}
                    </p>
                    {total === 0 && (
                        <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 8, border: "none", background: "#ff0000", color: "white", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                            + Add First Video
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                    {filtered.map(video => {
                        const isExpanded = expandedId === video.id;
                        const catColor = CAT_COLORS[video.category] || "#8888aa";
                        return (
                            <div key={video.id} style={{
                                background: "var(--surface)", border: `1px solid ${video.watched ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
                                borderRadius: 14, overflow: "hidden", transition: "all 0.2s",
                            }}>
                                {/* Thumbnail */}
                                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : video.id)}>
                                    <img
                                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                                        alt={video.title}
                                        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                                    />
                                    {/* Play overlay */}
                                    <div style={{
                                        position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
                                        opacity: isExpanded ? 0 : 1, transition: "opacity 0.2s",
                                    }}>
                                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▶</div>
                                    </div>
                                    {/* Watched badge */}
                                    {video.watched && (
                                        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(16,185,129,0.9)", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontFamily: "monospace", color: "white" }}>
                                            ✓ Watched
                                        </div>
                                    )}
                                    {/* Category badge */}
                                    <div style={{ position: "absolute", top: 8, left: 8, background: `${catColor}ee`, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontFamily: "monospace", color: "white" }}>
                                        {video.category}
                                    </div>
                                </div>

                                {/* Embedded player when expanded */}
                                {isExpanded && (
                                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                                            allowFullScreen
                                        />
                                    </div>
                                )}

                                {/* Info */}
                                <div style={{ padding: "14px" }}>
                                    <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 10 }}>
                                        {video.title}
                                    </p>

                                    {/* Notes */}
                                    {editingNote === video.id ? (
                                        <div style={{ marginBottom: 10 }}>
                                            <textarea
                                                value={noteText} onChange={e => setNoteText(e.target.value)}
                                                placeholder="Add your notes here..."
                                                rows={3}
                                                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 11, fontFamily: "monospace", color: "var(--text-primary)", resize: "none", outline: "none" }}
                                                onFocus={e => e.target.style.borderColor = "#ff4444"}
                                                onBlur={e => e.target.style.borderColor = "var(--border)"}
                                            />
                                            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                                <button onClick={() => saveNote(video.id)} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#10b981", color: "white", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }}>Save</button>
                                                <button onClick={() => setEditingNote(null)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : video.notes ? (
                                        <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 10px", marginBottom: 10, fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", lineHeight: 1.5, cursor: "pointer" }}
                                            onClick={() => { setEditingNote(video.id); setNoteText(video.notes); }}>
                                            📝 {video.notes}
                                        </div>
                                    ) : null}

                                    {/* Actions */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                        <button onClick={() => toggleWatched(video.id)} style={{
                                            flex: 1, padding: "7px 10px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", cursor: "pointer",
                                            background: video.watched ? "rgba(16,185,129,0.12)" : "rgba(99,102,241,0.12)",
                                            border: `1px solid ${video.watched ? "rgba(16,185,129,0.35)" : "rgba(99,102,241,0.35)"}`,
                                            color: video.watched ? "#10b981" : "#6366f1",
                                        }}>
                                            {video.watched ? "✓ Watched" : "Mark Watched"}
                                        </button>

                                        <button onClick={() => { setEditingNote(video.id); setNoteText(video.notes); }} style={{ padding: "7px 10px", borderRadius: 8, fontSize: 11, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}
                                            title="Add notes">📝</button>

                                        <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ padding: "7px 10px", borderRadius: 8, fontSize: 11, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", textDecoration: "none" }}
                                            title="Open on YouTube">↗</a>

                                        <button onClick={() => deleteVideo(video.id)} style={{ padding: "7px 10px", borderRadius: 8, fontSize: 11, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#f87171", cursor: "pointer" }}
                                            title="Remove">🗑</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}