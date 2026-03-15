"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: name } },
        });
        if (error) { setError(error.message); setLoading(false); return; }
        setSuccess(true);
        setLoading(false);
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) { setError(error.message); setGoogleLoading(false); }
    };

    if (success) {
        return (
            <div style={styles.page}>
                <div style={styles.glowBlue} />
                <div style={styles.card}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
                        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", marginBottom: 12 }}>
                            Check your email!
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                            We sent a confirmation link to <strong style={{ color: "#6366f1" }}>{email}</strong>.
                            Click it to activate your account and start tracking!
                        </p>
                        <Link href="/login" style={{ display: "inline-block", marginTop: 24, color: "#6366f1", fontSize: 13, textDecoration: "none" }}>
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.glowBlue} />
            <div style={styles.glowGreen} />

            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logo}>
                    <div style={styles.logoIcon}>📚</div>
                    <div>
                        <div style={styles.logoTitle}>Study Tracker</div>
                        <div style={styles.logoSub}>Track your ML & System Design journey</div>
                    </div>
                </div>

                <h1 style={styles.heading}>Create your account</h1>
                <p style={styles.subheading}>Join and start tracking your progress today</p>

                {/* Google */}
                <button onClick={handleGoogle} disabled={googleLoading} style={styles.googleBtn}>
                    {googleLoading ? (
                        <span style={styles.spinner} />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    <span>{googleLoading ? "Connecting..." : "Sign up with Google"}</span>
                </button>

                <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerText}>or</span>
                    <div style={styles.dividerLine} />
                </div>

                <form onSubmit={handleSignup} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            type="text" value={name} onChange={e => setName(e.target.value)}
                            placeholder="Rahul" required style={styles.input}
                            onFocus={e => (e.target.style.borderColor = "#6366f1")}
                            onBlur={e => (e.target.style.borderColor = "var(--border)")}
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="rahul@example.com" required style={styles.input}
                            onFocus={e => (e.target.style.borderColor = "#6366f1")}
                            onBlur={e => (e.target.style.borderColor = "var(--border)")}
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Password <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>(min 6 chars)</span></label>
                        <input
                            type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••" required style={styles.input}
                            onFocus={e => (e.target.style.borderColor = "#6366f1")}
                            onBlur={e => (e.target.style.borderColor = "var(--border)")}
                        />
                    </div>

                    {error && <div style={styles.error}>⚠ {error}</div>}

                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? <span style={styles.spinner} /> : null}
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Already have an account?{" "}
                    <Link href="/login" style={styles.link}>Sign in</Link>
                </p>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: var(--text-secondary); opacity: 0.6; }
      `}</style>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)", position: "relative", overflow: "hidden", padding: "20px",
    },
    glowBlue: {
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
        top: "5%", right: "15%", pointerEvents: "none",
    },
    glowGreen: {
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        bottom: "5%", left: "15%", pointerEvents: "none",
    },
    card: {
        width: "100%", maxWidth: 420, background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 20, padding: "40px",
        position: "relative", zIndex: 1, boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
    },
    logo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32 },
    logoIcon: {
        width: 40, height: 40, borderRadius: 10, background: "#6366f1",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
    },
    logoTitle: { fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" },
    logoSub: { fontSize: 11, color: "var(--text-secondary)", marginTop: 2 },
    heading: { fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", marginBottom: 6 },
    subheading: { fontSize: 13, color: "var(--text-secondary)", marginBottom: 28 },
    googleBtn: {
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: "12px", borderRadius: 10, border: "1px solid var(--border)",
        background: "var(--surface2)", color: "var(--text-primary)", fontSize: 14,
        fontFamily: "DM Sans, sans-serif", fontWeight: 500, cursor: "pointer",
        transition: "all 0.2s", marginBottom: 20,
    },
    divider: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, background: "var(--border)" },
    dividerText: { fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" },
    form: { display: "flex", flexDirection: "column", gap: 14 },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", letterSpacing: "0.05em" },
    input: {
        padding: "11px 14px", borderRadius: 8, border: "1px solid var(--border)",
        background: "var(--bg)", color: "var(--text-primary)", fontSize: 14,
        fontFamily: "DM Sans, sans-serif", outline: "none", transition: "border-color 0.2s",
    },
    error: {
        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171", fontFamily: "monospace",
    },
    submitBtn: {
        padding: "13px", borderRadius: 10, border: "none",
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        color: "white", fontSize: 14, fontFamily: "Syne, sans-serif", fontWeight: 700,
        cursor: "pointer", transition: "opacity 0.2s", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8, marginTop: 4,
    },
    switchText: { marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" },
    link: { color: "#6366f1", textDecoration: "none", fontWeight: 600 },
    spinner: {
        width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "white", animation: "spin 0.7s linear infinite", display: "inline-block",
    },
};