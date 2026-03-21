// "use client";
// import { useState } from "react";
// import { CustomTrack, updateCustomTopicStatus, updateCustomTopicNotes, removeCustomTrack } from "@/lib/custom-tracks";
// import { addSRTopic, loadSRTopics } from "@/lib/spaced-repetition";

// type Filter = "all" | "not_started" | "in_progress" | "done";

// const STATUS_CYCLE: Record<string, string> = {
//     not_started: "in_progress",
//     in_progress: "done",
//     done: "not_started",
// };

// const STATUS_LABELS: Record<string, string> = {
//     not_started: "Not Started",
//     in_progress: "In Progress",
//     done: "Done",
// };

// export default function CustomTrackView({
//     track, userId, onUpdate,
// }: {
//     track: CustomTrack; userId: string; onUpdate: () => void;
// }) {
//     //const [openSection, setOpenSection] = useState<string | null>(Object.keys(track.sections)[0]);
//     const [openSection, setOpenSection] = useState<string | null>(
//         Object.keys(track.sections || {})[0] || null
//     );
//     const [filter, setFilter] = useState<Filter>("all");
//     const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
//     const [noteText, setNoteText] = useState("");
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//     const handleStatus = (topicId: string, current: string) => {
//         updateCustomTopicStatus(userId, track.id, topicId, STATUS_CYCLE[current]);
//         onUpdate();
//     };

//     const handleSaveNote = (topicId: string) => {
//         updateCustomTopicNotes(userId, track.id, topicId, noteText);
//         setExpandedNotes(null);
//         onUpdate();
//     };

//     const handleDelete = () => {
//         removeCustomTrack(userId, track.id);
//         onUpdate();
//     };

//     const handleChallenge = (topicId: string, title: string) => {
//         addSRTopic(userId, { id: topicId, title, trackTitle: track.title });
//     };

//     const filters: { key: Filter; label: string }[] = [
//         { key: "all", label: "All" },
//         { key: "not_started", label: "Not Started" },
//         { key: "in_progress", label: "In Progress" },
//         { key: "done", label: "Done" },
//     ];

//     if (!track) {
//         return <div>No track selected</div>;
//     }

//     // Total stats
//     let total = 0, done = 0, inProg = 0;
//     for (const s of Object.values(track.sections)) {
//         for (const t of s.topics) {
//             total++;
//             if (t.status === "done") done++;
//             else if (t.status === "in_progress") inProg++;
//         }
//     }
//     const pct = total > 0 ? Math.round((done / total) * 100) : 0;

//     return (
//         <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//             {/* Header */}
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//                     <div style={{ width: 44, height: 44, borderRadius: 14, background: `${track.color}22`, border: `1px solid ${track.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
//                         {track.icon}
//                     </div>
//                     <div>
//                         <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>{track.title}</h2>
//                         <a href={track.source} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", textDecoration: "none" }}>
//                             {track.source} ↗
//                         </a>
//                     </div>
//                 </div>

//                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                     <div style={{ fontSize: 12, fontFamily: "monospace", display: "flex", gap: 8 }}>
//                         <span style={{ color: track.color, fontWeight: 600 }}>{pct}%</span>
//                         <span style={{ color: "var(--text-secondary)" }}>·</span>
//                         <span style={{ color: "#10b981" }}>{done} done</span>
//                         <span style={{ color: "var(--text-secondary)" }}>·</span>
//                         <span style={{ color: "#f59e0b" }}>{inProg} in progress</span>
//                     </div>
//                     {/* Delete button */}
//                     <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "transparent", color: "#f87171", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }}>
//                         🗑 Remove
//                     </button>
//                 </div>
//             </div>

//             {/* Delete confirm */}
//             {showDeleteConfirm && (
//                 <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
//                     <p style={{ fontSize: 13, color: "var(--text-primary)" }}>Remove this track? All progress will be lost.</p>
//                     <div style={{ display: "flex", gap: 8 }}>
//                         <button onClick={handleDelete} style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "white", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>Remove</button>
//                         <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             {/* Filter tabs */}
//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                 {filters.map(f => (
//                     <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, fontFamily: "monospace", cursor: "pointer", background: filter === f.key ? track.color : "transparent", border: `1px solid ${filter === f.key ? track.color : "var(--border)"}`, color: filter === f.key ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>
//                         {f.label}
//                     </button>
//                 ))}
//             </div>

//             {/* Sections */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                 {Object.entries(track.sections).map(([sKey, section]) => {
//                     const filtered = section.topics.filter(t => filter === "all" || t.status === filter);
//                     if (filtered.length === 0 && filter !== "all") return null;
//                     const secDone = section.topics.filter(t => t.status === "done").length;
//                     const secTotal = section.topics.length;
//                     const isOpen = openSection === sKey;

//                     return (
//                         <div key={sKey} style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", overflow: "hidden" }}>
//                             {/* Section header */}
//                             <button onClick={() => setOpenSection(isOpen ? null : sKey)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.2s" }}
//                                 onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
//                                 onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
//                             >
//                                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                                     <div style={{ width: 3, height: 18, borderRadius: 2, background: isOpen ? track.color : "var(--muted)", transition: "background 0.2s" }} />
//                                     <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{section.title}</span>
//                                     <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)" }}>{secDone}/{secTotal}</span>
//                                 </div>
//                                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                                     <div style={{ width: 72, height: 3, background: "var(--muted)", borderRadius: 2, overflow: "hidden" }}>
//                                         <div style={{ height: "100%", width: `${secTotal > 0 ? (secDone / secTotal) * 100 : 0}%`, background: track.color, borderRadius: 2 }} />
//                                     </div>
//                                     <span style={{ color: "var(--text-secondary)", fontSize: 12, display: "inline-block", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
//                                 </div>
//                             </button>

//                             {/* Topics */}
//                             {isOpen && (
//                                 <div style={{ borderTop: "1px solid var(--border)" }}>
//                                     {filtered.map((topic, i) => (
//                                         <div key={topic.id}
//                                             style={{ padding: "11px 18px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s" }}
//                                             onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
//                                             onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
//                                         >
//                                             {/* Status dot */}
//                                             <button onClick={() => handleStatus(topic.id, topic.status)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }} title={`→ ${STATUS_LABELS[STATUS_CYCLE[topic.status]]}`}>
//                                                 <div style={{ width: 9, height: 9, borderRadius: "50%", background: topic.status === "done" ? "#10b981" : topic.status === "in_progress" ? "#f59e0b" : "var(--muted)", boxShadow: topic.status === "done" ? "0 0 6px rgba(16,185,129,0.5)" : topic.status === "in_progress" ? "0 0 6px rgba(245,158,11,0.5)" : "none" }} />
//                                             </button>

//                                             {/* Title */}
//                                             <a href={topic.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, color: topic.status === "done" ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: topic.status === "done" ? "line-through" : "none", fontFamily: "DM Sans,sans-serif" }}
//                                                 onMouseEnter={e => { if (topic.status !== "done") (e.target as HTMLElement).style.color = track.color; }}
//                                                 onMouseLeave={e => { (e.target as HTMLElement).style.color = topic.status === "done" ? "var(--text-secondary)" : "var(--text-primary)"; }}
//                                             >
//                                                 {topic.title}
//                                             </a>

//                                             {/* Actions */}
//                                             <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
//                                                 <button onClick={() => handleStatus(topic.id, topic.status)} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10, fontFamily: "monospace", cursor: "pointer", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", transition: "all 0.15s" }}
//                                                     onMouseEnter={e => { (e.currentTarget.style.borderColor = track.color); (e.currentTarget.style.color = track.color); }}
//                                                     onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}>
//                                                     {STATUS_LABELS[topic.status]}
//                                                 </button>

//                                                 <button onClick={() => handleChallenge(topic.id, topic.title)} title="Mark as challenging" style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", transition: "all 0.15s" }}
//                                                     onMouseEnter={e => { (e.currentTarget.style.borderColor = "#ef4444"); (e.currentTarget.style.color = "#ef4444"); }}
//                                                     onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}>
//                                                     🔴
//                                                 </button>

//                                                 <button onClick={() => { setExpandedNotes(expandedNotes === topic.id ? null : topic.id); setNoteText(topic.notes || ""); }} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: expandedNotes === topic.id ? `${track.color}18` : "transparent", border: expandedNotes === topic.id ? `1px solid ${track.color}55` : "1px solid var(--border)", color: expandedNotes === topic.id ? track.color : "var(--text-secondary)", transition: "all 0.15s" }}>
//                                                     📝
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     ))}

//                                     {/* Notes panel */}
//                                     {filtered.map(topic => expandedNotes === topic.id && (
//                                         <div key={`note-${topic.id}`} style={{ padding: "10px 18px 14px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
//                                             <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add notes..." rows={3}
//                                                 style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "monospace", color: "var(--text-primary)", resize: "none", outline: "none" }}
//                                                 onFocus={e => (e.target.style.borderColor = track.color)}
//                                                 onBlur={e => (e.target.style.borderColor = "var(--border)")}
//                                             />
//                                             <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
//                                                 <button onClick={() => handleSaveNote(topic.id)} style={{ padding: "5px 14px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", cursor: "pointer", background: track.color, border: "none", color: "white" }}>Save</button>
//                                                 <button onClick={() => setExpandedNotes(null)} style={{ padding: "5px 14px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", cursor: "pointer", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }


//"use client";
"use client";
import { useState } from "react";
import { CustomTrack, updateCustomTopicStatus, updateCustomTopicNotes, removeCustomTrack } from "@/lib/custom-tracks";
import { addSRTopic } from "@/lib/spaced-repetition";
import TopicExplainer from "@/components/TopicExplainer";

type Filter = "all" | "not_started" | "in_progress" | "done";

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

export default function CustomTrackView({
    track, userId, onUpdate,
}: {
    track: CustomTrack;
    userId: string;
    onUpdate: () => void;
}) {
    const [openSection, setOpenSection] = useState<string | null>(Object.keys(track.sections)[0]);
    const [filter, setFilter] = useState<Filter>("all");
    const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [explainerTopic, setExplainerTopic] = useState<{ id: string; title: string } | null>(null);

    const handleStatus = (topicId: string, current: string) => {
        updateCustomTopicStatus(userId, track.id, topicId, STATUS_CYCLE[current]);
        onUpdate();
    };

    const handleSaveNote = (topicId: string) => {
        updateCustomTopicNotes(userId, track.id, topicId, noteText);
        setExpandedNotes(null);
        onUpdate();
    };

    const handleDelete = () => {
        removeCustomTrack(userId, track.id);
        onUpdate();
    };

    const handleChallenge = (topicId: string, title: string) => {
        addSRTopic(userId, { id: topicId, title, trackTitle: track.title });
    };

    const filters: { key: Filter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "not_started", label: "Not Started" },
        { key: "in_progress", label: "In Progress" },
        { key: "done", label: "Done" },
    ];

    let total = 0, done = 0, inProg = 0;
    for (const s of Object.values(track.sections)) {
        for (const t of s.topics) {
            total++;
            if (t.status === "done") done++;
            else if (t.status === "in_progress") inProg++;
        }
    }
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <>
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${track.color}22`, border: `1px solid ${track.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                            {track.icon}
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>{track.title}</h2>
                            <a href={track.source} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", textDecoration: "none" }}>
                                {track.source} ↗
                            </a>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 12, fontFamily: "monospace", display: "flex", gap: 8 }}>
                            <span style={{ color: track.color, fontWeight: 600 }}>{pct}%</span>
                            <span style={{ color: "var(--text-secondary)" }}>·</span>
                            <span style={{ color: "#10b981" }}>{done} done</span>
                            <span style={{ color: "var(--text-secondary)" }}>·</span>
                            <span style={{ color: "#f59e0b" }}>{inProg} in progress</span>
                        </div>
                        <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "transparent", color: "#f87171", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }}>
                            🗑 Remove
                        </button>
                    </div>
                </div>

                {/* Delete confirm */}
                {showDeleteConfirm && (
                    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <p style={{ fontSize: 13, color: "var(--text-primary)" }}>Remove this track? All progress will be lost.</p>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={handleDelete} style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "white", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>Remove</button>
                            <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Filter tabs */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {filters.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, fontFamily: "monospace", cursor: "pointer", background: filter === f.key ? track.color : "transparent", border: `1px solid ${filter === f.key ? track.color : "var(--border)"}`, color: filter === f.key ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Sections */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(track.sections).map(([sKey, section]) => {
                        const filtered = section.topics.filter(t => filter === "all" || t.status === filter);
                        if (filtered.length === 0 && filter !== "all") return null;

                        const secDone = section.topics.filter(t => t.status === "done").length;
                        const secTotal = section.topics.length;
                        const isOpen = openSection === sKey;

                        return (
                            <div key={sKey} style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", overflow: "hidden" }}>
                                {/* Section header */}
                                <button
                                    onClick={() => setOpenSection(isOpen ? null : sKey)}
                                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", background: "transparent", border: "none", cursor: "pointer" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 3, height: 18, borderRadius: 2, background: isOpen ? track.color : "var(--muted)", transition: "background 0.2s" }} />
                                        <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{section.title}</span>
                                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)" }}>{secDone}/{secTotal}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 72, height: 3, background: "var(--muted)", borderRadius: 2, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${secTotal > 0 ? (secDone / secTotal) * 100 : 0}%`, background: track.color, borderRadius: 2 }} />
                                        </div>
                                        <span style={{ color: "var(--text-secondary)", fontSize: 12, display: "inline-block", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                                    </div>
                                </button>

                                {/* Topics */}
                                {isOpen && (
                                    <div style={{ borderTop: "1px solid var(--border)" }}>
                                        {filtered.map((topic, i) => (
                                            <div key={topic.id}>
                                                <div
                                                    style={{ padding: "11px 18px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 10 }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                                >
                                                    {/* Status dot */}
                                                    <button onClick={() => handleStatus(topic.id, topic.status)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }} title={`→ ${STATUS_LABELS[STATUS_CYCLE[topic.status]]}`}>
                                                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: topic.status === "done" ? "#10b981" : topic.status === "in_progress" ? "#f59e0b" : "var(--muted)", boxShadow: topic.status === "done" ? "0 0 6px rgba(16,185,129,0.5)" : topic.status === "in_progress" ? "0 0 6px rgba(245,158,11,0.5)" : "none" }} />
                                                    </button>

                                                    {/* Title */}
                                                    <a href={topic.url} target="_blank" rel="noopener noreferrer"
                                                        style={{ flex: 1, fontSize: 13, color: topic.status === "done" ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: topic.status === "done" ? "line-through" : "none", fontFamily: "DM Sans,sans-serif" }}
                                                        onMouseEnter={e => { if (topic.status !== "done") (e.target as HTMLElement).style.color = track.color; }}
                                                        onMouseLeave={e => { (e.target as HTMLElement).style.color = topic.status === "done" ? "var(--text-secondary)" : "var(--text-primary)"; }}
                                                    >
                                                        {topic.title}
                                                    </a>

                                                    {/* Actions */}
                                                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                                        {/* Status */}
                                                        <button onClick={() => handleStatus(topic.id, topic.status)}
                                                            style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10, fontFamily: "monospace", cursor: "pointer", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", transition: "all 0.15s" }}
                                                            onMouseEnter={e => { (e.currentTarget.style.borderColor = track.color); (e.currentTarget.style.color = track.color); }}
                                                            onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}>
                                                            {STATUS_LABELS[topic.status]}
                                                        </button>

                                                        {/* 🤖 AI Explain */}
                                                        <button
                                                            onClick={() => setExplainerTopic(explainerTopic?.id === topic.id ? null : { id: topic.id, title: topic.title })}
                                                            title="AI Explain this topic"
                                                            style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: explainerTopic?.id === topic.id ? "rgba(16,185,129,0.12)" : "transparent", border: explainerTopic?.id === topic.id ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border)", color: explainerTopic?.id === topic.id ? "#10b981" : "var(--text-secondary)", transition: "all 0.15s" }}
                                                            onMouseEnter={e => { if (explainerTopic?.id !== topic.id) { (e.currentTarget.style.borderColor = "#10b981"); (e.currentTarget.style.color = "#10b981"); } }}
                                                            onMouseLeave={e => { if (explainerTopic?.id !== topic.id) { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); } }}
                                                        >
                                                            🤖
                                                        </button>

                                                        {/* 🔴 Challenging */}
                                                        <button onClick={() => handleChallenge(topic.id, topic.title)}
                                                            title="Mark as challenging"
                                                            style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", transition: "all 0.15s" }}
                                                            onMouseEnter={e => { (e.currentTarget.style.borderColor = "#ef4444"); (e.currentTarget.style.color = "#ef4444"); }}
                                                            onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}>
                                                            🔴
                                                        </button>

                                                        {/* Notes */}
                                                        <button
                                                            onClick={() => { setExpandedNotes(expandedNotes === topic.id ? null : topic.id); setNoteText(topic.notes || ""); }}
                                                            style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: expandedNotes === topic.id ? `${track.color}18` : "transparent", border: expandedNotes === topic.id ? `1px solid ${track.color}55` : "1px solid var(--border)", color: expandedNotes === topic.id ? track.color : "var(--text-secondary)", transition: "all 0.15s" }}>
                                                            📝
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Notes panel */}
                                                {expandedNotes === topic.id && (
                                                    <div style={{ padding: "10px 18px 14px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
                                                        <textarea
                                                            value={noteText}
                                                            onChange={e => setNoteText(e.target.value)}
                                                            placeholder="Add notes..."
                                                            rows={3}
                                                            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "monospace", color: "var(--text-primary)", resize: "none", outline: "none" }}
                                                            onFocus={e => (e.target.style.borderColor = track.color)}
                                                            onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                                        />
                                                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                                            <button onClick={() => handleSaveNote(topic.id)} style={{ padding: "5px 14px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", cursor: "pointer", background: track.color, border: "none", color: "white" }}>Save</button>
                                                            <button onClick={() => setExpandedNotes(null)} style={{ padding: "5px 14px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", cursor: "pointer", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* AI Explainer panel */}
            {explainerTopic && (
                <TopicExplainer
                    topicTitle={explainerTopic.title}
                    trackTitle={track.title}
                    onClose={() => setExplainerTopic(null)}
                />
            )}
        </>
    );
}