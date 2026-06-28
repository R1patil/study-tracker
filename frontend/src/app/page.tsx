import Link from "next/link";

export const metadata = {
    title: "Study Tracker — Learn better, every day.",
    description: "Track your ML, System Design & MLOps learning. Simple, focused, effective.",
};

export default function HomePage() {
    return (
        <div style={s.page}>

            {/* NAV */}
            <nav style={s.nav}>
                <div style={s.navInner}>
                    <span style={s.navLogo}>Study Tracker</span>
                    <div style={s.navLinks}>
                        <Link href="/privacy" style={s.navLink}>Privacy</Link>
                        <Link href="/terms" style={s.navLink}>Terms</Link>
                        <Link href="/login" style={s.navLink}>Sign in</Link>
                        <Link href="/signup" style={s.navCta}>Get started</Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section style={s.hero}>
                <p style={s.eyebrow}>Free for students & developers</p>
                <h1 style={s.h1}>Learn better,<br />every day.</h1>
                <p style={s.sub}>
                    A clean, focused study tracker for ML, System Design,<br />
                    and MLOps. Track progress. Stay consistent.
                </p>
                <div style={s.heroBtns}>
                    <Link href="/signup" style={s.btnDark}>Get started free</Link>
                    <Link href="/login" style={s.btnLight}>Sign in →</Link>
                </div>
            </section>

            {/* DIVIDER */}
            <div style={s.divider} />

            {/* FEATURES */}
            <section style={s.features}>
                {FEATURES.map(f => (
                    <div key={f.title} style={s.feat}>
                        <h3 style={s.featTitle}>{f.title}</h3>
                        <p style={s.featDesc}>{f.desc}</p>
                    </div>
                ))}
            </section>

            {/* DIVIDER */}
            <div style={s.divider} />

            {/* CTA */}
            <section style={s.cta}>
                <h2 style={s.ctaTitle}>Start tracking today.</h2>
                <p style={s.ctaSub}>Free. No credit card required.</p>
                <Link href="/signup" style={s.btnDark}>Create your account</Link>
            </section>

            {/* FOOTER */}
            <footer style={s.footer}>
                <span style={s.footerText}>© 2025 Study Tracker</span>
                <div style={s.footerLinks}>
                    <Link href="/privacy" style={s.footerLink}>Privacy Policy</Link>
                    <Link href="/terms" style={s.footerLink}>Terms</Link>
                    <a href="mailto:studyforyou107@gmail.com" style={s.footerLink}>Contact</a>
                </div>
            </footer>
        </div>
    );
}

const FEATURES = [
    { title: "Topic Tracking", desc: "Log what you study. See exactly how far you've come." },
    { title: "Spaced Repetition", desc: "Smart reminders so you review at the perfect time." },
    { title: "Calendar Sync", desc: "Adds study reminders directly to Google Calendar." },
    { title: "Progress View", desc: "Streaks, scores, and charts. Stay motivated." },
];

const s: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#ffffff",
        color: "#1d1d1f",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
    },

    // Nav
    nav: {
        borderBottom: "1px solid #e5e5e5",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
    },
    navInner: {
        maxWidth: 980, margin: "0 auto",
        padding: "0 22px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    navLogo: { fontSize: 17, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.3px" },
    navLinks: { display: "flex", alignItems: "center", gap: 28 },
    navLink: { fontSize: 14, color: "#6e6e73", textDecoration: "none" },
    navCta: {
        fontSize: 14, color: "#ffffff", textDecoration: "none",
        background: "#1d1d1f", padding: "7px 16px", borderRadius: 980,
        fontWeight: 500,
    },

    // Hero
    hero: {
        maxWidth: 700, margin: "0 auto",
        padding: "100px 22px 80px",
        textAlign: "center",
    },
    eyebrow: { fontSize: 14, color: "#6e6e73", marginBottom: 20, letterSpacing: "0.01em" },
    h1: {
        fontSize: "clamp(48px, 7vw, 80px)",
        fontWeight: 700,
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        color: "#1d1d1f",
        marginBottom: 24,
    },
    sub: {
        fontSize: 19, color: "#6e6e73", lineHeight: 1.6,
        marginBottom: 40, fontWeight: 400,
    },
    heroBtns: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" },
    btnDark: {
        padding: "14px 28px", borderRadius: 980,
        background: "#1d1d1f", color: "#ffffff",
        fontSize: 15, fontWeight: 500,
        textDecoration: "none", display: "inline-block",
    },
    btnLight: {
        padding: "14px 28px", borderRadius: 980,
        background: "transparent", color: "#1d1d1f",
        fontSize: 15, fontWeight: 500,
        textDecoration: "none", display: "inline-block",
        border: "1px solid #d2d2d7",
    },

    // Divider
    divider: { height: 1, background: "#e5e5e5", maxWidth: 980, margin: "0 auto" },

    // Features
    features: {
        maxWidth: 980, margin: "0 auto",
        padding: "80px 22px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 48,
    },
    feat: {},
    featTitle: { fontSize: 17, fontWeight: 600, color: "#1d1d1f", marginBottom: 8, letterSpacing: "-0.2px" },
    featDesc: { fontSize: 14, color: "#6e6e73", lineHeight: 1.6, margin: 0 },

    // CTA
    cta: {
        padding: "80px 22px",
        textAlign: "center",
        background: "#f5f5f7",
    },
    ctaTitle: { fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "#1d1d1f", marginBottom: 8, letterSpacing: "-0.02em" },
    ctaSub: { fontSize: 16, color: "#6e6e73", marginBottom: 32 },

    // Footer
    footer: {
        borderTop: "1px solid #e5e5e5",
        padding: "20px 22px",
        maxWidth: 980, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
    },
    footerText: { fontSize: 13, color: "#6e6e73" },
    footerLinks: { display: "flex", gap: 24 },
    footerLink: { fontSize: 13, color: "#6e6e73", textDecoration: "none" },
};
