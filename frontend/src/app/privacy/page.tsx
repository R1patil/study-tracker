import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | Study Tracker",
    description: "Privacy Policy for Study Tracker — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
    return (
        <div style={styles.page}>
            {/* Background glows */}
            <div style={styles.glowBlue} />
            <div style={styles.glowPurple} />

            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <Link href="/" style={styles.backLink}>← Back to Home</Link>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>🧭</div>
                        <div>
                            <div style={styles.logoTitle}>JollyRoger.AI</div>
                            <div style={styles.logoSub}>Navigate your ML, System Design & MLOps voyages</div>
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div style={styles.card}>
                    <div style={styles.badge}>Legal</div>
                    <h1 style={styles.heading}>Privacy Policy</h1>
                    <p style={styles.lastUpdated}>Last updated: June 28, 2025</p>

                    <div style={styles.intro}>
                        Welcome to <strong>Study Tracker</strong> (operating at <strong>seventeense.com</strong>). 
                        We are committed to protecting your personal information and your right to privacy. 
                        This Privacy Policy explains how we collect, use, and safeguard your data.
                    </div>

                    <Section title="1. Information We Collect">
                        <p>We collect the following types of information when you use our service:</p>
                        <ul>
                            <li><strong>Account Information:</strong> Name, email address, and profile picture when you sign up via Google OAuth or email/password.</li>
                            <li><strong>Study Activity Data:</strong> Topics studied, time spent, progress logs, notes, and reminders you create.</li>
                            <li><strong>Google Calendar Data:</strong> If you grant calendar access, we create study reminder events on your behalf.</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, and interactions within the app to improve your experience.</li>
                        </ul>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <ul>
                            <li>To provide and maintain the Study Tracker service.</li>
                            <li>To personalize your learning dashboard and track your study progress.</li>
                            <li>To send study reminders via Google Calendar (only with your explicit permission).</li>
                            <li>To improve and optimize our platform based on usage patterns.</li>
                            <li>To communicate important updates or changes to our service.</li>
                        </ul>
                    </Section>

                    <Section title="3. Google OAuth & Calendar Access">
                        <p>When you sign in with Google, we request access to:</p>
                        <ul>
                            <li><strong>Basic profile info:</strong> Name, email, and profile picture for your account.</li>
                            <li><strong>Google Calendar (optional):</strong> To add study reminder events directly to your calendar. You can revoke this access at any time from your Google Account settings.</li>
                        </ul>
                        <p>We do <strong>not</strong> read, modify, or delete any existing calendar events. We only create new study reminder events.</p>
                    </Section>

                    <Section title="4. Data Storage & Security">
                        <p>Your data is securely stored using <strong>Supabase</strong>, a trusted cloud database provider with industry-standard encryption. We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    </Section>

                    <Section title="5. Data Sharing">
                        <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share data only with:</p>
                        <ul>
                            <li><strong>Supabase:</strong> Our database and authentication provider.</li>
                            <li><strong>Google:</strong> For OAuth authentication and Calendar API integration.</li>
                            <li><strong>Legal requirements:</strong> If required by law or legal process.</li>
                        </ul>
                    </Section>

                    <Section title="6. Data Retention">
                        <p>We retain your personal data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us at <a href="mailto:studyforyou107@gmail.com" style={styles.mailLink}>studyforyou107@gmail.com</a>.</p>
                    </Section>

                    <Section title="7. Your Rights">
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access the personal data we hold about you.</li>
                            <li>Request correction of inaccurate data.</li>
                            <li>Request deletion of your account and data.</li>
                            <li>Withdraw Google Calendar access at any time.</li>
                            <li>Export your study data.</li>
                        </ul>
                    </Section>

                    <Section title="8. Cookies">
                        <p>We use session cookies to keep you logged in. We do not use tracking cookies or third-party advertising cookies.</p>
                    </Section>

                    <Section title="9. Children's Privacy">
                        <p>Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
                    </Section>

                    <Section title="10. Changes to This Policy">
                        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date. Continued use of the service after changes constitutes acceptance of the new policy.</p>
                    </Section>

                    <Section title="11. Contact Us">
                        <p>If you have any questions about this Privacy Policy, please contact us:</p>
                        <div style={styles.contactBox}>
                            <p>📧 <strong>Email:</strong> <a href="mailto:studyforyou107@gmail.com" style={styles.mailLink}>studyforyou107@gmail.com</a></p>
                            <p>🌐 <strong>Website:</strong> <a href="https://seventeense.com" style={styles.mailLink}>seventeense.com</a></p>
                        </div>
                    </Section>

                    <div style={styles.footer}>
                        <Link href="/terms" style={styles.footerLink}>Terms of Service</Link>
                        <span style={styles.dot}>·</span>
                        <Link href="/" style={styles.footerLink}>Back to App</Link>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                ul { padding-left: 20px; }
                ul li { margin-bottom: 8px; line-height: 1.7; }
                p { margin: 0 0 12px 0; line-height: 1.7; }
                strong { color: var(--text-primary); }
            `}</style>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={sectionStyles.wrapper}>
            <h2 style={sectionStyles.title}>{title}</h2>
            <div style={sectionStyles.body}>{children}</div>
        </div>
    );
}

const sectionStyles: Record<string, React.CSSProperties> = {
    wrapper: { marginBottom: 32 },
    title: {
        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16,
        color: "var(--text-primary)", marginBottom: 12,
        paddingBottom: 8, borderBottom: "1px solid var(--border)",
    },
    body: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 },
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh", background: "var(--bg)", position: "relative",
        overflow: "hidden", padding: "40px 20px",
    },
    glowBlue: {
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
        top: "-10%", left: "10%", pointerEvents: "none",
    },
    glowPurple: {
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
        bottom: "10%", right: "10%", pointerEvents: "none",
    },
    container: { maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 },
    backLink: {
        fontSize: 13, color: "var(--text-secondary)", textDecoration: "none",
        fontFamily: "monospace", transition: "color 0.2s",
    },
    logo: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: {
        width: 36, height: 36, borderRadius: 9,
        background: "linear-gradient(135deg, #2aa198, #d4af37)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
    },
    logoTitle: { fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" },
    logoSub: { fontSize: 10, color: "var(--text-secondary)", marginTop: 1 },
    card: {
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20,
        padding: "48px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        animation: "fadeIn 0.5s ease",
    },
    badge: {
        display: "inline-block", padding: "4px 12px", borderRadius: 20,
        background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
        color: "#818cf8", fontSize: 11, fontFamily: "monospace",
        letterSpacing: "0.1em", marginBottom: 16,
    },
    heading: {
        fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32,
        color: "var(--text-primary)", marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace",
        marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--border)",
    },
    intro: {
        background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 12, padding: "16px 20px", fontSize: 14,
        color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 36,
    },
    contactBox: {
        background: "var(--surface2)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "16px 20px", marginTop: 12,
    },
    mailLink: { color: "#6366f1", textDecoration: "none" },
    footer: {
        marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 16, justifyContent: "center",
    },
    footerLink: { fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" },
    dot: { color: "var(--border)" },
};
