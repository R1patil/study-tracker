"use client";
import { useState, useEffect } from "react";

interface TopicExplainerProps {
    topicTitle: string;
    trackTitle: string;
    repoContext?: string;
    onClose: () => void;
}

interface Explanation {
    simple: string;
    importance: string;
    useCase: string;
    learningTime: string;
    keyPoints: string[];
}

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";

export default function TopicExplainer({
    topicTitle, trackTitle, repoContext, onClose,
}: TopicExplainerProps) {
    const [data, setData] = useState<Explanation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchExplanation();
    }, [topicTitle]);

    const fetchExplanation = async () => {
        setLoading(true);
        setError("");
        setData(null);

        const prompt = `You are an expert software engineer and teacher.
Given a topic from a GitHub repository, generate a structured explanation.

Topic: "${topicTitle}"
Track/Context: "${trackTitle}"
${repoContext ? `Repo Summary: ${repoContext.slice(0, 300)}` : ""}

Return ONLY this exact JSON (no markdown, no backticks):
{
  "simple": "2-3 sentence beginner-friendly explanation of what this topic is",
  "importance": "1-2 sentences on why this is important for interviews/jobs",
  "useCase": "1 concrete real-world example of where this is used (mention a real company or product)",
  "learningTime": "X-Y minutes (realistic estimate to understand the basics)",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"]
}`;

        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    max_tokens: 600,
                    temperature: 0.3,
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            if (res.status === 429) {
                setError("AI limit reached for today. Come back tomorrow!");
                setLoading(false);
                return;
            }

            if (!res.ok) throw new Error("API error");

            const apiData = await res.json();
            let text = apiData.choices?.[0]?.message?.content || "";

            // Clean JSON
            text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
            const first = text.indexOf("{");
            const last = text.lastIndexOf("}");
            if (first !== -1 && last !== -1) text = text.slice(first, last + 1);

            const parsed = JSON.parse(text);
            setData(parsed);
        } catch {
            setError("Could not generate explanation. Please try again.");
        }
        setLoading(false);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, backdropFilter: "blur(2px)" }}
            />

            {/* Panel */}
            <div style={{
                position: "fixed", right: 0, top: 0, height: "100vh", width: 420,
                background: "var(--surface)", borderLeft: "1px solid var(--border)",
                zIndex: 101, display: "flex", flexDirection: "column",
                animation: "slideIn 0.25s ease",
                boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
            }}>
                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                AI Explainer
                            </span>
                        </div>
                        <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.3 }}>
                            {topicTitle}
                        </h2>
                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", marginTop: 3 }}>{trackTitle}</p>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 18, padding: "2px 6px", borderRadius: 6, flexShrink: 0, lineHeight: 1 }}>✕</button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

                    {loading && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {/* Skeleton loader */}
                            {[120, 80, 100, 60, 90].map((w, i) => (
                                <div key={i} style={{ height: i === 0 ? 60 : 16, borderRadius: 8, background: "var(--muted)", width: `${w}%`, animation: "shimmer 1.5s infinite", backgroundImage: "linear-gradient(90deg, var(--muted) 25%, var(--border) 50%, var(--muted) 75%)", backgroundSize: "200% 100%" }} />
                            ))}
                            <p style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", textAlign: "center", marginTop: 8 }}>
                                ⚡ Generating explanation...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, textAlign: "center" }}>
                            <p style={{ fontSize: 13, color: "#f87171", fontFamily: "monospace", marginBottom: 12 }}>⚠ {error}</p>
                            <button onClick={fetchExplanation} style={{ padding: "7px 18px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.1)", color: "#6366f1", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
                                Try Again
                            </button>
                        </div>
                    )}

                    {data && (
                        <>
                            {/* Learning time badge */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", fontSize: 11, fontFamily: "monospace", color: "#6366f1" }}>
                                    ⏱ {data.learningTime}
                                </span>
                                <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>to learn the basics</span>
                            </div>

                            {/* Simple explanation */}
                            <Section icon="💡" title="What is it?" color="#6366f1">
                                <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, fontFamily: "DM Sans,sans-serif" }}>
                                    {data.simple}
                                </p>
                            </Section>

                            {/* Importance */}
                            <Section icon="🎯" title="Why it matters?" color="#f59e0b">
                                <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, fontFamily: "DM Sans,sans-serif" }}>
                                    {data.importance}
                                </p>
                            </Section>

                            {/* Real world use case */}
                            <Section icon="🚀" title="Real-world use case" color="#10b981">
                                <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, fontFamily: "DM Sans,sans-serif" }}>
                                    {data.useCase}
                                </p>
                            </Section>

                            {/* Key points */}
                            {data.keyPoints && data.keyPoints.length > 0 && (
                                <Section icon="📌" title="Key Points" color="#e879f9">
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {data.keyPoints.map((point, i) => (
                                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(232,121,249,0.15)", border: "1px solid rgba(232,121,249,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#e879f9", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                                                    {i + 1}
                                                </div>
                                                <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, fontFamily: "DM Sans,sans-serif" }}>{point}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                        ⚡ Powered by Groq · Llama 3.3
                    </span>
                    {data && (
                        <button onClick={fetchExplanation} style={{ padding: "5px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 11, fontFamily: "monospace", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={e => { (e.currentTarget.style.borderColor = "#6366f1"); (e.currentTarget.style.color = "#6366f1"); }}
                            onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}
                        >
                            🔄 Regenerate
                        </button>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
        </>
    );
}

function Section({ icon, title, color, children }: { icon: string; title: string; color: string; children: React.ReactNode }) {
    return (
        <div style={{ background: "var(--bg)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${color}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 12, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
            </div>
            {children}
        </div>
    );
}