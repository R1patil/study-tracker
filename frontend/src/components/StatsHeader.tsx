"use client";

export default function StatsHeader({ stats }: { stats: any }) {
    if (!stats) return null;
    const { overall, streaks, sessions } = stats;

    const today = new Date().toISOString().slice(0, 10);
    const todayMins = sessions
        .filter((s: any) => s.date === today)
        .reduce((acc: number, s: any) => acc + (s.duration_mins || 0), 0);

    const cards = [
        { label: "Overall Progress", value: `${overall.percent}%`, sub: `${overall.done} of ${overall.total} topics`, color: "#6366f1", icon: "📊", progress: overall.percent },
        { label: "Study Streak", value: `${streaks.current} day${streaks.current !== 1 ? "s" : ""}`, sub: `Best: ${streaks.longest} days`, color: "#f59e0b", icon: "🔥" },
        { label: "Today's Study", value: `${Math.round(todayMins)} min`, sub: `${sessions.length} sessions total`, color: "#10b981", icon: "⏱️" },
        { label: "Topics Done", value: String(overall.done), sub: `${overall.total - overall.done} remaining`, color: "#818cf8", icon: "✅" },
    ];

    return (
        <div className="fade-up">
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: "var(--text-primary)" }}>
                    Your Study Dashboard
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {cards.map((c) => (
                    <div key={c.label} style={{
                        background: "var(--surface)", borderRadius: 12,
                        border: `1px solid ${c.color}22`, padding: 16,
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                {c.label}
                            </span>
                            <span style={{ fontSize: 18 }}>{c.icon}</span>
                        </div>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 26, color: c.color }}>
                            {c.value}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{c.sub}</div>
                        {c.progress !== undefined && (
                            <div style={{ height: 3, background: "var(--muted)", borderRadius: 2, overflow: "hidden", marginTop: 10 }}>
                                <div style={{ height: "100%", width: `${c.progress}%`, background: c.color, borderRadius: 2, transition: "width 0.6s ease" }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}