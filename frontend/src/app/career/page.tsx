"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Language = "English" | "Hindi" | "Kannada" | "Hinglish";
type Message = { role: "user" | "assistant"; content: string; time: string };

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const LANGUAGES: { key: Language; label: string; flag: string }[] = [
    { key: "English", label: "English", flag: "🇬🇧" },
    { key: "Hindi", label: "हिंदी", flag: "🇮🇳" },
    { key: "Kannada", label: "ಕನ್ನಡ", flag: "🇮🇳" },
    { key: "Hinglish", label: "Hinglish", flag: "🇮🇳" },
];

const FEATURES = [
    { icon: "🗺️", title: "Study Roadmap", desc: "Personalized week-by-week study plan", prompt: "Create a personalized study roadmap for me. First ask about my current skills, target role, and timeline." },
    { icon: "🚀", title: "Career Guidance", desc: "Best career paths for Indian tech students", prompt: "Guide me on the best career path in tech. First ask about my background, interests and goals." },
    { icon: "🎯", title: "Skill Gap Analysis", desc: "Find what skills you're missing", prompt: "Analyze my skill gaps for my dream job. First ask about my current skills and target role." },
    { icon: "📄", title: "Resume & LinkedIn", desc: "Tips to improve your profile", prompt: "Help me improve my resume and LinkedIn. First ask about my experience and target companies." },
];

const QUICK_QUESTIONS = [
    "I'm a CSE student in 3rd year, what should I focus on?",
    "How to get an internship at a product company in India?",
    "Should I focus on DSA or System Design first?",
    "How to build a strong LinkedIn as a fresher?",
    "What skills do I need for a backend developer role?",
    "How to prepare for FAANG interviews from India?",
    "I know Python and FastAPI, what should I learn next?",
    "Difference between service and product companies in India?",
];

function getSystemPrompt(lang: Language) {
    const l: Record<Language, string> = {
        English: "Always respond in clear simple English.",
        Hindi: "हमेशा सरल हिंदी में जवाब दो। Technical terms English में रख सकते हो।",
        Kannada: "ಯಾವಾಗಲೂ ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. Technical terms English ನಲ್ಲಿ ಇರಬಹುದು.",
        Hinglish: "Hinglish mein jawab do — Hindi aur English mix karke, jaise dost baat karta hai.",
    };
    return `You are an AI Career Mentor specifically for Indian engineering and tech students. You are friendly, practical and encouraging.\n\n${l[lang]}\n\nYour expertise:\n- Career guidance for Indian CS/IT/MCA students\n- Skill roadmaps for Software Engineering, ML, Data Science, Backend, Frontend, DevOps\n- Interview prep (DSA, System Design, ML interviews)\n- Internship and job hunting in India (service vs product companies)\n- Resume and LinkedIn optimization for Indian freshers\n- Salary guidance in INR, Indian company context (TCS, Infosys, Wipro, Razorpay, Zepto etc)\n- Higher studies (MS abroad, MBA)\n- Government exams (GATE, UPSC) if asked\n\nAlways give practical actionable advice with Indian context. Use emojis to be friendly. Be concise but complete. Ask clarifying questions when needed to give personalized advice.`;
}

export default function CareerMentorPage() {
    const [language, setLanguage] = useState<Language>("English");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const [limitHit, setLimitHit] = useState(false);
    const [error, setError] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const now = () =>
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading || limitHit) return;
        setError("");
        setStarted(true);

        const userMsg: Message = { role: "user", content: text.trim(), time: now() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    max_tokens: 1024,
                    temperature: 0.7,
                    messages: [
                        { role: "system", content: getSystemPrompt(language) },
                        ...updated.map(m => ({ role: m.role, content: m.content })),
                    ],
                }),
            });

            // ── Handle rate limit / quota errors ─────────────────
            if (res.status === 429) {
                setLimitHit(true);
                setLoading(false);
                return;
            }

            if (res.status === 401) {
                setError("API configuration error. Please contact the developer.");
                setLoading(false);
                return;
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                // Check if it's a rate limit in the error body too
                if (err?.error?.code === "rate_limit_exceeded" || res.status === 429) {
                    setLimitHit(true);
                    setLoading(false);
                    return;
                }
                setError("Something went wrong. Please try again in a moment.");
                setLoading(false);
                return;
            }

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "Sorry, could not generate a response. Please try again.";
            setMessages(prev => [...prev, { role: "assistant", content: reply, time: now() }]);

        } catch {
            setError("Network error. Please check your connection and try again.");
        }

        setLoading(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    };

    const formatMessage = (text: string) =>
        text.split("\n").map((line, i) => {
            if (line.startsWith("### ")) return <h4 key={i} style={{ color: "var(--text-primary)", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, margin: "10px 0 4px" }}>{line.slice(4)}</h4>;
            if (line.startsWith("## ")) return <h3 key={i} style={{ color: "var(--text-primary)", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, margin: "12px 0 4px" }}>{line.slice(3)}</h3>;
            if (line.startsWith("# ")) return <h2 key={i} style={{ color: "var(--text-primary)", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 17, margin: "12px 0 6px" }}>{line.slice(2)}</h2>;
            if (line.startsWith("**") && line.endsWith("**")) return <strong key={i} style={{ color: "var(--text-primary)", display: "block", marginTop: 6 }}>{line.slice(2, -2)}</strong>;
            if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} style={{ display: "flex", gap: 8, marginTop: 4 }}><span style={{ color: "#6366f1", flexShrink: 0 }}>▸</span><span>{line.slice(2)}</span></div>;
            if (line.match(/^\d+\./)) return <div key={i} style={{ display: "flex", gap: 8, marginTop: 4 }}><span style={{ color: "#6366f1", flexShrink: 0, fontWeight: 700 }}>{line.split(".")[0]}.</span><span>{line.split(".").slice(1).join(".").trim()}</span></div>;
            if (line === "") return <div key={i} style={{ height: 6 }} />;
            return <p key={i} style={{ margin: "3px 0", lineHeight: 1.6 }}>{line}</p>;
        });

    // ── Limit reached screen ──────────────────────────────────
    if (limitHit) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                <div style={{ maxWidth: 480, width: "100%", background: "var(--surface)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: 40, textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>⚡</div>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 12 }}>
                        Daily AI Limit Reached
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                        The free AI quota for today has been used up. The developer has been notified and the limit resets every 24 hours.
                    </p>

                    {/* Info box */}
                    <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
                        <p style={{ fontSize: 12, fontFamily: "monospace", color: "#f59e0b", marginBottom: 8, fontWeight: 600 }}>📢 Developer Note</p>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                            Hi! I'm Rahul, the developer of this app. The daily free AI limit has been reached.
                            Please come back tomorrow — it resets automatically at midnight! 🙏
                        </p>
                        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <a href="https://www.youtube.com/@R-B107" target="_blank" rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.3)", color: "#ff4444", fontSize: 12, fontFamily: "monospace", textDecoration: "none" }}>
                                📺 @R-B107
                            </a>
                            <a href="https://github.com/R1patil/study-tracker" target="_blank" rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#6366f1", fontSize: 12, fontFamily: "monospace", textDecoration: "none" }}>
                                ⭐ GitHub
                            </a>
                        </div>
                    </div>

                    {/* Reset timer */}
                    <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
                        <p style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                            🔄 Limit resets in: <span style={{ color: "#10b981", fontWeight: 600 }}>{getTimeUntilMidnight()}</span>
                        </p>
                    </div>

                    <Link href="/dashboard" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "white", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

            {/* Header */}
            <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, position: "sticky", top: 0, zIndex: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Link href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: 13, fontFamily: "monospace", textDecoration: "none" }}>← Back</Link>
                    <div style={{ width: 1, height: 20, background: "var(--border)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🤖</div>
                        <div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>AI Career Mentor</div>
                            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#10b981" }}>● Free · Powered by Groq + Llama 3.3</div>
                        </div>
                    </div>
                </div>

                {/* Language tabs */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {LANGUAGES.map(l => (
                        <button key={l.key} onClick={() => setLanguage(l.key)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontFamily: "monospace", cursor: "pointer", background: language === l.key ? "#6366f1" : "transparent", border: `1px solid ${language === l.key ? "#6366f1" : "var(--border)"}`, color: language === l.key ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>
                            {l.flag} {l.key}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, maxWidth: 860, width: "100%", margin: "0 auto", padding: "0 16px", paddingBottom: 130 }}>

                {/* Welcome screen */}
                {!started && (
                    <div style={{ paddingTop: 36 }}>
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <div style={{ fontSize: 48, marginBottom: 10 }}>🎓</div>
                            <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", marginBottom: 8 }}>
                                AI Career Mentor
                            </h1>
                            <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
                                Free personalized career guidance for Indian engineering students.<br />
                                No sign up needed — just ask anything! 🚀
                            </p>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "5px 14px", borderRadius: 20, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#10b981" }}>⚡ Powered by Groq · Llama 3.3 70B · 100% Free</span>
                            </div>
                        </div>

                        {/* Feature cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px,1fr))", gap: 12, marginBottom: 32 }}>
                            {FEATURES.map(f => (
                                <button key={f.title} onClick={() => sendMessage(f.prompt)}
                                    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseEnter={e => { (e.currentTarget.style.borderColor = "#6366f1"); (e.currentTarget.style.background = "rgba(99,102,241,0.06)"); }}
                                    onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.background = "var(--surface)"); }}
                                >
                                    <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
                                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>{f.title}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>{f.desc}</div>
                                </button>
                            ))}
                        </div>

                        {/* Quick questions */}
                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Quick Questions</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} onClick={() => sendMessage(q)}
                                    style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: "DM Sans,sans-serif", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseEnter={e => { (e.currentTarget.style.borderColor = "#6366f1"); (e.currentTarget.style.color = "#6366f1"); }}
                                    onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}
                                >{q}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                    <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: msg.role === "user" ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                                    {msg.role === "user" ? "👤" : "🤖"}
                                </div>
                                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 3, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                                    <div style={{ padding: "11px 15px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "var(--surface)", border: msg.role === "user" ? "none" : "1px solid var(--border)", fontSize: 13, color: msg.role === "user" ? "white" : "var(--text-primary)", fontFamily: "DM Sans,sans-serif", lineHeight: 1.6 }}>
                                        {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
                                    </div>
                                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)", padding: "0 4px" }}>{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🤖</div>
                                <div style={{ padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", gap: 5, alignItems: "center" }}>
                                    {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}

                {error && (
                    <div style={{ margin: "12px 0", padding: "10px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13, color: "#f87171", fontFamily: "monospace" }}>
                        ⚠ {error}
                    </div>
                )}
            </div>

            {/* Fixed input bar */}
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "14px 24px", zIndex: 50 }}>
                <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <textarea
                        ref={inputRef} value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            language === "Hindi" ? "अपना करियर सवाल यहाँ पूछो..." :
                                language === "Kannada" ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಇಲ್ಲಿ ಕೇಳಿ..." :
                                    language === "Hinglish" ? "Apna career question yahan poocho..." :
                                        "Ask your career question... (Enter to send)"
                        }
                        rows={1} disabled={loading || limitHit}
                        style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "11px 14px", fontSize: 13, fontFamily: "DM Sans,sans-serif", color: "var(--text-primary)", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 120, overflow: "auto", transition: "border-color 0.2s" }}
                        onFocus={e => (e.target.style.borderColor = "#6366f1")}
                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                        onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; }}
                    />
                    <button onClick={() => sendMessage(input)} disabled={loading || !input.trim() || limitHit}
                        style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: input.trim() && !loading && !limitHit ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "var(--muted)", color: "white", fontSize: 18, cursor: input.trim() && !loading && !limitHit ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                        {loading ? "⏳" : "↑"}
                    </button>
                </div>
                <p style={{ textAlign: "center", fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)", marginTop: 6 }}>
                    ⚡ Powered by Groq · Llama 3.3 70B · Free for all users · Built by Rahul @R-B107
                </p>
            </div>

            <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
        textarea::placeholder { color: var(--text-secondary); opacity: 0.6; }
      `}</style>
        </div>
    );
}

function getTimeUntilMidnight(): string {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
}