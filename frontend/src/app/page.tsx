import Link from "next/link";

export const metadata = {
    title: "Study Tracker — Navigate your ML, System Design & MLOps voyages",
    description: "Study Tracker helps you track your learning progress, manage study schedules, and stay on top of ML, System Design, and MLOps topics. Sign in with Google to get started.",
};

export default function HomePage() {
    return (
        <div style={styles.page}>
            {/* Background glows */}
            <div style={styles.glowBlue} />
            <div style={styles.glowPurple} />
            <div style={styles.glowGreen} />

            {/* ── NAV ── */}
            <nav style={styles.nav}>
                <div style={styles.navInner}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>🧭</div>
                        <div>
                            <div style={styles.logoTitle}>Study Tracker</div>
                            <div style={styles.logoSub}>by JollyRoger.AI</div>
                        </div>
                    </div>
                    <div style={styles.navLinks}>
                        <Link href="/privacy" style={styles.navLink}>Privacy</Link>
                        <Link href="/terms" style={styles.navLink}>Terms</Link>
                        <Link href="/login" style={styles.navCta}>Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section style={styles.hero}>
                <div style={styles.heroBadge}>🚀 Free for students &amp; developers</div>
                <h1 style={styles.heroTitle}>
                    Navigate your
                    <span style={styles.heroGradient}> ML, System Design</span>
                    <br />& MLOps voyages
                </h1>
                <p style={styles.heroSub}>
                    Study Tracker is your personal learning dashboard — track topics, manage schedules,
                    set spaced-repetition reminders, and stay consistent on your journey to mastering
                    Machine Learning, System Design, and MLOps.
                </p>
                <div style={styles.heroBtns}>
                    <Link href="/signup" style={styles.btnPrimary}>Get Started Free →</Link>
                    <Link href="/login" style={styles.btnSecondary}>Sign In</Link>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section style={styles.features}>
                <h2 style={styles.sectionTitle}>Everything you need to study smarter</h2>
                <p style={styles.sectionSub}>
                    Study Tracker combines progress tracking, spaced repetition, and calendar integration
                    into one beautiful dashboard.
                </p>
                <div style={styles.featureGrid}>
                    {FEATURES.map((f) => (
                        <div key={f.title} style={styles.featureCard}>
                            <div style={styles.featureIcon}>{f.icon}</div>
                            <h3 style={styles.featureTitle}>{f.title}</h3>
                            <p style={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={styles.howSection}>
                <h2 style={styles.sectionTitle}>How Study Tracker works</h2>
                <div style={styles.steps}>
                    {STEPS.map((s, i) => (
                        <div key={s.title} style={styles.step}>
                            <div style={styles.stepNum}>{i + 1}</div>
                            <h3 style={styles.stepTitle}>{s.title}</h3>
                            <p style={styles.stepDesc}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaCard}>
                    <h2 style={styles.ctaTitle}>Ready to level up your study game?</h2>
                    <p style={styles.ctaSub}>Join students and developers using Study Tracker to stay consistent and focused.</p>
                    <Link href="/signup" style={styles.btnPrimary}>Start tracking for free →</Link>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={styles.footer}>
                <div style={styles.footerInner}>
                    <div style={styles.footerLogo}>
                        <div style={styles.logoIcon}>🧭</div>
                        <span style={styles.logoTitle}>Study Tracker</span>
                    </div>
                    <p style={styles.footerDesc}>
                        A personal learning management tool for ML, System Design &amp; MLOps enthusiasts.
                    </p>
                    <div style={styles.footerLinks}>
                        <Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link>
                        <span style={styles.dot}>·</span>
                        <Link href="/terms" style={styles.footerLink}>Terms of Service</Link>
                        <span style={styles.dot}>·</span>
                        <a href="mailto:studyforyou107@gmail.com" style={styles.footerLink}>Contact</a>
                    </div>
                    <p style={styles.footerCopy}>© 2025 Study Tracker. Built with ❤️ by JollyRoger.AI</p>
                </div>
            </footer>

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            `}</style>
        </div>
    );
}

const FEATURES = [
    { icon: "📚", title: "Topic Tracking", desc: "Log every topic you study with timestamps, categories, and progress scores. Never lose track of what you've covered." },
    { icon: "🔁", title: "Spaced Repetition", desc: "Smart review reminders based on spaced repetition science — review topics at the perfect intervals for maximum retention." },
    { icon: "📅", title: "Google Calendar Sync", desc: "Automatically add study reminders to your Google Calendar. Stay on schedule without leaving your calendar app." },
    { icon: "📊", title: "Progress Dashboard", desc: "Visualize your learning journey with beautiful charts and streak tracking. See how far you've come." },
    { icon: "🤖", title: "AI Study Assistant", desc: "Get intelligent topic suggestions, study plans, and search assistance powered by AI to guide your learning." },
    { icon: "🎯", title: "Career Roadmaps", desc: "Follow structured learning roadmaps for ML Engineer, MLOps, and System Design roles at top companies." },
];

const STEPS = [
    { title: "Create your account", desc: "Sign up free with Google or email. Your dashboard is ready instantly — no setup needed." },
    { title: "Add your study topics", desc: "Log topics you're studying across ML, System Design, MLOps, or any subject. Add notes and difficulty ratings." },
    { title: "Get smart reminders", desc: "Study Tracker schedules review reminders using spaced repetition and syncs them to your Google Calendar." },
    { title: "Track your progress", desc: "Watch your knowledge grow with streak tracking, topic mastery scores, and visual progress charts." },
];

const styles: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" },
    glowBlue: {
        position: "fixed", width: 700, height: 700, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        top: "-15%", left: "-5%",
    },
    glowPurple: {
        position: "fixed", width: 500, height: 500, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
        top: "20%", right: "-10%",
    },
    glowGreen: {
        position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
        bottom: "-10%", left: "30%",
    },

    // Nav
    nav: {
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(var(--bg-rgb, 13,13,20), 0.85)",
        backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)",
    },
    navInner: {
        maxWidth: 1100, margin: "0 auto", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    logo: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: {
        width: 36, height: 36, borderRadius: 9,
        background: "linear-gradient(135deg, #2aa198, #d4af37)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        animation: "float 4s ease-in-out infinite",
    },
    logoTitle: { fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" },
    logoSub: { fontSize: 10, color: "var(--text-secondary)" },
    navLinks: { display: "flex", alignItems: "center", gap: 24 },
    navLink: { fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" },
    navCta: {
        padding: "8px 20px", borderRadius: 8,
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        color: "white", fontSize: 13, fontFamily: "Syne, sans-serif",
        fontWeight: 600, textDecoration: "none", transition: "opacity 0.2s",
    },

    // Hero
    hero: {
        maxWidth: 900, margin: "0 auto", padding: "100px 24px 80px",
        textAlign: "center", animation: "fadeUp 0.7s ease",
    },
    heroBadge: {
        display: "inline-block", padding: "6px 16px", borderRadius: 20,
        background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
        color: "#818cf8", fontSize: 12, fontFamily: "monospace",
        letterSpacing: "0.05em", marginBottom: 28,
    },
    heroTitle: {
        fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 68px)",
        color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 24,
    },
    heroGradient: {
        background: "linear-gradient(135deg, #6366f1, #2aa198)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },
    heroSub: {
        fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-secondary)",
        lineHeight: 1.8, maxWidth: 680, margin: "0 auto 40px",
    },
    heroBtns: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" },
    btnPrimary: {
        padding: "14px 32px", borderRadius: 10,
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        color: "white", fontSize: 15, fontFamily: "Syne, sans-serif",
        fontWeight: 700, textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
    },
    btnSecondary: {
        padding: "14px 32px", borderRadius: 10,
        background: "var(--surface)", border: "1px solid var(--border)",
        color: "var(--text-primary)", fontSize: 15, fontFamily: "Syne, sans-serif",
        fontWeight: 600, textDecoration: "none", transition: "all 0.2s",
    },

    // Features
    features: { maxWidth: 1100, margin: "0 auto", padding: "80px 24px" },
    sectionTitle: {
        fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)",
        color: "var(--text-primary)", textAlign: "center", marginBottom: 12,
    },
    sectionSub: {
        fontSize: 15, color: "var(--text-secondary)", textAlign: "center",
        maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.7,
    },
    featureGrid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20,
    },
    featureCard: {
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
        padding: "28px", transition: "transform 0.2s, box-shadow 0.2s",
    },
    featureIcon: { fontSize: 32, marginBottom: 16 },
    featureTitle: {
        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16,
        color: "var(--text-primary)", marginBottom: 8,
    },
    featureDesc: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 },

    // How it works
    howSection: {
        maxWidth: 1100, margin: "0 auto", padding: "80px 24px",
        borderTop: "1px solid var(--border)",
    },
    steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginTop: 48 },
    step: {
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "28px", position: "relative",
    },
    stepNum: {
        width: 40, height: 40, borderRadius: 10,
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18,
        marginBottom: 16,
    },
    stepTitle: {
        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
        color: "var(--text-primary)", marginBottom: 8,
    },
    stepDesc: { fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 },

    // CTA
    ctaSection: { maxWidth: 1100, margin: "0 auto", padding: "80px 24px" },
    ctaCard: {
        background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(42,161,152,0.1))",
        border: "1px solid rgba(99,102,241,0.25)", borderRadius: 24,
        padding: "64px 40px", textAlign: "center",
        boxShadow: "0 20px 60px rgba(99,102,241,0.15)",
    },
    ctaTitle: {
        fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)",
        color: "var(--text-primary)", marginBottom: 12,
    },
    ctaSub: {
        fontSize: 15, color: "var(--text-secondary)", marginBottom: 32,
        maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7,
    },

    // Footer
    footer: {
        borderTop: "1px solid var(--border)",
        padding: "48px 24px",
    },
    footerInner: { maxWidth: 1100, margin: "0 auto", textAlign: "center" },
    footerLogo: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 12 },
    footerDesc: { fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 },
    footerLinks: { display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" },
    footerLink: { fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" },
    dot: { color: "var(--border)" },
    footerCopy: { fontSize: 12, color: "var(--text-secondary)", opacity: 0.6 },
};
