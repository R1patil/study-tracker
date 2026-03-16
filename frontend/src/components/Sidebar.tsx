// "use client";

// const TC: Record<string, { color: string; bg: string; border: string }> = {
//     system_design: { color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.4)" },
//     machine_learning: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.4)" },
//     mlops: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)" },
// };

// export default function Sidebar({ tracks, activeTrack, onSelect }: { tracks: any; activeTrack: string; onSelect: (k: string) => void }) {
//     return (
//         <aside style={{
//             position: "fixed", left: 0, top: 0, height: "100vh", width: 256,
//             background: "var(--surface)", borderRight: "1px solid var(--border)",
//             display: "flex", flexDirection: "column", zIndex: 50,
//         }}>
//             {/* Logo */}
//             <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
//                 <div style={{ width: 32, height: 32, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
//                     📚
//                 </div>
//                 <div>
//                     <div style={{ color: "var(--text-primary)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>Study Tracker</div>
//                     <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 10 }}>by Rahul</div>
//                 </div>
//             </div>

//             {/* Nav */}
//             <nav style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
//                 <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px 8px" }}>
//                     Learning Tracks
//                 </div>

//                 {tracks && Object.entries(tracks).map(([key, track]: [string, any]) => {
//                     const isActive = activeTrack === key;
//                     const tc = TC[key] || TC.system_design;
//                     return (
//                         <button key={key} onClick={() => onSelect(key)} style={{
//                             width: "100%", textAlign: "left", borderRadius: 10, padding: "12px",
//                             background: isActive ? tc.bg : "transparent",
//                             border: `1px solid ${isActive ? tc.border : "var(--border)"}`,
//                             cursor: "pointer", transition: "all 0.2s",
//                         }}>
//                             <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
//                                 <span style={{ fontSize: 18 }}>{track.icon}</span>
//                                 <span style={{ color: isActive ? tc.color : "var(--text-primary)", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13 }}>
//                                     {track.title}
//                                 </span>
//                             </div>
//                             <div style={{ marginLeft: 28 }}>
//                                 <div style={{ height: 3, background: "var(--muted)", borderRadius: 2, overflow: "hidden" }}>
//                                     <div style={{ height: "100%", width: `${track.percent}%`, background: tc.color, borderRadius: 2, transition: "width 0.5s ease" }} />
//                                 </div>
//                                 <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
//                                     <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>{track.done}/{track.total}</span>
//                                     <span style={{ fontSize: 10, fontFamily: "monospace", color: tc.color }}>{track.percent}%</span>
//                                 </div>
//                             </div>
//                         </button>
//                     );
//                 })}
//             </nav>

//             {/* Footer */}
//             <div style={{ borderTop: "1px solid var(--border)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>

//                 {/* YouTube Challenges link */}
//                 <a href="/youtube"
//                     style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,68,68,0.25)", background: "rgba(255,0,0,0.06)", textDecoration: "none", transition: "all 0.2s" }}
//                     onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,0,0,0.12)"); (e.currentTarget.style.borderColor = "rgba(255,68,68,0.5)"); }}
//                     onMouseLeave={e => { (e.currentTarget.style.background = "rgba(255,0,0,0.06)"); (e.currentTarget.style.borderColor = "rgba(255,68,68,0.25)"); }}
//                 >
//                     <div style={{ width: 24, height: 24, borderRadius: 6, background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>▶</div>
//                     <div>
//                         <div style={{ color: "#ff4444", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 12 }}>YouTube Challenges</div>
//                         <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>@R-B107</div>
//                     </div>
//                 </a>

//                 <a href="https://github.com/ashishps1/awesome-system-design-resources" target="_blank" rel="noopener noreferrer"
//                     style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 11, fontFamily: "monospace", textDecoration: "none" }}>
//                     <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
//                     </svg>
//                     View Resources on GitHub
//                 </a>
//             </div>
//         </aside>
//     );
// }



// "use client";

// const TC: Record<string, { color: string; bg: string; border: string }> = {
//     system_design: { color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.4)" },
//     machine_learning: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.4)" },
//     mlops: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)" },
// };

// export default function Sidebar({ tracks, activeTrack, onSelect }: { tracks: any; activeTrack: string; onSelect: (k: string) => void }) {
//     return (
//         <aside style={{
//             position: "fixed", left: 0, top: 0, height: "100vh", width: 256,
//             background: "var(--surface)", borderRight: "1px solid var(--border)",
//             display: "flex", flexDirection: "column", zIndex: 50,
//         }}>
//             {/* Logo */}
//             <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
//                 <div style={{ width: 32, height: 32, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
//                     📚
//                 </div>
//                 <div>
//                     <div style={{ color: "var(--text-primary)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>Study Tracker</div>
//                     <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 10 }}>by Rahul</div>
//                 </div>
//             </div>

//             {/* Nav */}
//             <nav style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
//                 <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px 8px" }}>
//                     Learning Tracks
//                 </div>

//                 {tracks && Object.entries(tracks).map(([key, track]: [string, any]) => {
//                     const isActive = activeTrack === key;
//                     const tc = TC[key] || TC.system_design;
//                     return (
//                         <button key={key} onClick={() => onSelect(key)} style={{
//                             width: "100%", textAlign: "left", borderRadius: 10, padding: "12px",
//                             background: isActive ? tc.bg : "transparent",
//                             border: `1px solid ${isActive ? tc.border : "var(--border)"}`,
//                             cursor: "pointer", transition: "all 0.2s",
//                         }}>
//                             <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
//                                 <span style={{ fontSize: 18 }}>{track.icon}</span>
//                                 <span style={{ color: isActive ? tc.color : "var(--text-primary)", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13 }}>
//                                     {track.title}
//                                 </span>
//                             </div>
//                             <div style={{ marginLeft: 28 }}>
//                                 <div style={{ height: 3, background: "var(--muted)", borderRadius: 2, overflow: "hidden" }}>
//                                     <div style={{ height: "100%", width: `${track.percent}%`, background: tc.color, borderRadius: 2, transition: "width 0.5s ease" }} />
//                                 </div>
//                                 <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
//                                     <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>{track.done}/{track.total}</span>
//                                     <span style={{ fontSize: 10, fontFamily: "monospace", color: tc.color }}>{track.percent}%</span>
//                                 </div>
//                             </div>
//                         </button>
//                     );
//                 })}
//             </nav>

//             {/* Footer */}
//             <div style={{ borderTop: "1px solid var(--border)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>

//                 {/* YouTube Challenges link */}
//                 <a href="/youtube"
//                     style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,68,68,0.25)", background: "rgba(255,0,0,0.06)", textDecoration: "none", transition: "all 0.2s" }}
//                     onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,0,0,0.12)"); (e.currentTarget.style.borderColor = "rgba(255,68,68,0.5)"); }}
//                     onMouseLeave={e => { (e.currentTarget.style.background = "rgba(255,0,0,0.06)"); (e.currentTarget.style.borderColor = "rgba(255,68,68,0.25)"); }}
//                 >
//                     <div style={{ width: 24, height: 24, borderRadius: 6, background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>▶</div>
//                     <div>
//                         <div style={{ color: "#ff4444", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 12 }}>YouTube Challenges</div>
//                         <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>@R-B107</div>
//                     </div>
//                 </a>

//                 {/* AI Career Mentor link */}
//                 <a href="/career"
//                     style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.06)", textDecoration: "none", transition: "all 0.2s" }}
//                     onMouseEnter={e => { (e.currentTarget.style.background = "rgba(99,102,241,0.12)"); (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"); }}
//                     onMouseLeave={e => { (e.currentTarget.style.background = "rgba(99,102,241,0.06)"); (e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"); }}
//                 >
//                     <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
//                     <div>
//                         <div style={{ color: "#6366f1", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 12 }}>AI Career Mentor</div>
//                         <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>For Indian Students</div>
//                     </div>
//                 </a>

//                 <a href="https://github.com/ashishps1/awesome-system-design-resources" target="_blank" rel="noopener noreferrer"
//                     style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 11, fontFamily: "monospace", textDecoration: "none" }}>
//                     <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
//                     </svg>
//                     View Resources on GitHub
//                 </a>
//             </div>
//         </aside>
//     );
// }



// "use client";

// const TC: Record<string, { color: string; bg: string; border: string }> = {
//     system_design: { color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.4)" },
//     machine_learning: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.4)" },
//     mlops: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)" },
// };

// export default function Sidebar({ tracks, activeTrack, onSelect }: { tracks: any; activeTrack: string; onSelect: (k: string) => void }) {
//     return (
//         <aside style={{
//             position: "fixed", left: 0, top: 0, height: "100vh", width: 256,
//             background: "var(--surface)", borderRight: "1px solid var(--border)",
//             display: "flex", flexDirection: "column", zIndex: 50,
//         }}>
//             {/* Logo */}
//             <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
//                 <div style={{ width: 32, height: 32, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
//                     📚
//                 </div>
//                 <div>
//                     <div style={{ color: "var(--text-primary)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>Study Tracker</div>
//                     <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 10 }}>by Rahul</div>
//                 </div>
//             </div>

//             {/* Nav */}
//             <nav style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
//                 <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px 8px" }}>
//                     Learning Tracks
//                 </div>

//                 {tracks && Object.entries(tracks).map(([key, track]: [string, any]) => {
//                     const isActive = activeTrack === key;
//                     const tc = TC[key] || TC.system_design;
//                     return (
//                         <button key={key} onClick={() => onSelect(key)} style={{
//                             width: "100%", textAlign: "left", borderRadius: 10, padding: "12px",
//                             background: isActive ? tc.bg : "transparent",
//                             border: `1px solid ${isActive ? tc.border : "var(--border)"}`,
//                             cursor: "pointer", transition: "all 0.2s",
//                         }}>
//                             <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
//                                 <span style={{ fontSize: 18 }}>{track.icon}</span>
//                                 <span style={{ color: isActive ? tc.color : "var(--text-primary)", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13 }}>
//                                     {track.title}
//                                 </span>
//                             </div>
//                             <div style={{ marginLeft: 28 }}>
//                                 <div style={{ height: 3, background: "var(--muted)", borderRadius: 2, overflow: "hidden" }}>
//                                     <div style={{ height: "100%", width: `${track.percent}%`, background: tc.color, borderRadius: 2, transition: "width 0.5s ease" }} />
//                                 </div>
//                                 <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
//                                     <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>{track.done}/{track.total}</span>
//                                     <span style={{ fontSize: 10, fontFamily: "monospace", color: tc.color }}>{track.percent}%</span>
//                                 </div>
//                             </div>
//                         </button>
//                     );
//                 })}
//             </nav>

//             {/* Footer */}
//             <div style={{ borderTop: "1px solid var(--border)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>

//                 {/* Reminders link */}
//                 <a href="/reminders"
//                     style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)", textDecoration: "none", transition: "all 0.2s" }}
//                 >
//                     <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🔔</div>
//                     <div>
//                         <div style={{ color: "#6366f1", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 12 }}>Study Reminders</div>
//                         <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>Spaced repetition</div>
//                     </div>
//                 </a>

//                 {/* YouTube Challenges link */}
//                 <a href="/youtube"
//                     style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,68,68,0.25)", background: "rgba(255,0,0,0.06)", textDecoration: "none", transition: "all 0.2s" }}
//                     onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,0,0,0.12)"); (e.currentTarget.style.borderColor = "rgba(255,68,68,0.5)"); }}
//                     onMouseLeave={e => { (e.currentTarget.style.background = "rgba(255,0,0,0.06)"); (e.currentTarget.style.borderColor = "rgba(255,68,68,0.25)"); }}
//                 >
//                     <div style={{ width: 24, height: 24, borderRadius: 6, background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>▶</div>
//                     <div>
//                         <div style={{ color: "#ff4444", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 12 }}>YouTube Challenges</div>
//                         <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>@R-B107</div>
//                     </div>
//                 </a>

//                 {/* AI Career Mentor link */}
//                 <a href="/career"
//                     style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.06)", textDecoration: "none", transition: "all 0.2s" }}
//                     onMouseEnter={e => { (e.currentTarget.style.background = "rgba(99,102,241,0.12)"); (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"); }}
//                     onMouseLeave={e => { (e.currentTarget.style.background = "rgba(99,102,241,0.06)"); (e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"); }}
//                 >
//                     <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
//                     <div>
//                         <div style={{ color: "#6366f1", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 12 }}>AI Career Mentor</div>
//                         <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>For Indian Students</div>
//                     </div>
//                 </a>

//                 <a href="https://github.com/ashishps1/awesome-system-design-resources" target="_blank" rel="noopener noreferrer"
//                     style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 11, fontFamily: "monospace", textDecoration: "none" }}>
//                     <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
//                     </svg>
//                     View Resources on GitHub
//                 </a>
//             </div>
//         </aside>
//     );
// }



"use client";
import { CustomTrack } from "@/lib/custom-tracks";

const TC: Record<string, { color: string; bg: string; border: string }> = {
    system_design: { color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.4)" },
    machine_learning: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.4)" },
    mlops: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)" },
};

export default function Sidebar({
    tracks, activeTrack, onSelect, customTracks = [],
}: {
    tracks: any;
    activeTrack: string;
    onSelect: (k: string) => void;
    customTracks?: CustomTrack[];
}) {
    const defaultTrackKeys = ["system_design", "machine_learning", "mlops"];

    const TrackButton = ({ trackKey, track, color }: { trackKey: string; track: any; color: string }) => {
        const isActive = activeTrack === trackKey;
        const bg = isActive ? `${color}18` : "transparent";
        const border = isActive ? `${color}55` : "var(--border)";

        return (
            <button onClick={() => onSelect(trackKey)} style={{ width: "100%", textAlign: "left", borderRadius: 10, padding: "11px 12px", background: bg, border: `1px solid ${border}`, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: 16 }}>{track.icon}</span>
                    <span style={{ color: isActive ? color : "var(--text-primary)", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 12, lineHeight: 1.2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {track.title}
                    </span>
                </div>
                <div style={{ marginLeft: 24 }}>
                    <div style={{ height: 3, background: "var(--muted)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${track.percent}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                        <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-secondary)" }}>{track.done}/{track.total}</span>
                        <span style={{ fontSize: 9, fontFamily: "monospace", color }}>{track.percent}%</span>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <aside style={{ position: "fixed", left: 0, top: 0, height: "100vh", width: 256, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 50 }}>
            {/* Logo */}
            <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📚</div>
                <div>
                    <div style={{ color: "var(--text-primary)", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 13 }}>Study Tracker</div>
                    <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>by Rahul</div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>

                {/* Default tracks */}
                <div style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 6px 8px" }}>
                    Default Tracks
                </div>
                {tracks && defaultTrackKeys.map(key => {
                    if (!tracks[key]) return null;
                    const tc = TC[key] || TC.system_design;
                    return <TrackButton key={key} trackKey={key} track={tracks[key]} color={tc.color} />;
                })}

                {/* Custom tracks */}
                {customTracks.length > 0 && (
                    <>
                        <div style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 6px 8px" }}>
                            My Repos ({customTracks.length})
                        </div>
                        {customTracks.map(ct => {
                            const trackData = tracks?.[ct.id];
                            if (!trackData) return null;
                            return <TrackButton key={ct.id} trackKey={ct.id} track={trackData} color={ct.color} />;
                        })}
                    </>
                )}

                {/* Add Repo button */}
                <a href="/add-repo" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "1px dashed var(--border)", background: "transparent", textDecoration: "none", marginTop: 6, transition: "all 0.2s", color: "var(--text-secondary)" }}
                    onMouseEnter={e => { (e.currentTarget.style.borderColor = "#6366f1"); (e.currentTarget.style.color = "#6366f1"); (e.currentTarget.style.background = "rgba(99,102,241,0.05)"); }}
                    onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); (e.currentTarget.style.background = "transparent"); }}
                >
                    <span style={{ fontSize: 16 }}>➕</span>
                    <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 12 }}>Add GitHub Repo</span>
                </a>
            </nav>

            {/* Footer links */}
            <div style={{ borderTop: "1px solid var(--border)", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                {/* Reminders */}
                <a href="/reminders" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background = "rgba(99,102,241,0.1)"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = "rgba(99,102,241,0.05)"); }}
                >
                    <span style={{ fontSize: 14 }}>🔔</span>
                    <div>
                        <div style={{ color: "#6366f1", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 11 }}>Study Reminders</div>
                        <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>Spaced repetition</div>
                    </div>
                </a>

                {/* YouTube */}
                <a href="/youtube" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,68,68,0.2)", background: "rgba(255,0,0,0.05)", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,0,0,0.1)"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = "rgba(255,0,0,0.05)"); }}
                >
                    <span style={{ fontSize: 14 }}>▶</span>
                    <div>
                        <div style={{ color: "#ff4444", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 11 }}>YouTube Challenges</div>
                        <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>@R-B107</div>
                    </div>
                </a>

                {/* AI Career Mentor */}
                <a href="/career" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background = "rgba(16,185,129,0.1)"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = "rgba(16,185,129,0.05)"); }}
                >
                    <span style={{ fontSize: 14 }}>🤖</span>
                    <div>
                        <div style={{ color: "#10b981", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 11 }}>AI Career Mentor</div>
                        <div style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 9 }}>Free · Groq AI</div>
                    </div>
                </a>

                {/* GitHub link */}
                <a href="https://github.com/R1patil/study-tracker" target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 10, fontFamily: "monospace", textDecoration: "none", padding: "4px 6px" }}>
                    <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    View on GitHub
                </a>
            </div>
        </aside>
    );
}

