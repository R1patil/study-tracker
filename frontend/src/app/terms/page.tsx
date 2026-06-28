import Link from "next/link";

export const metadata = {
    title: "Terms of Service | Study Tracker",
    description: "Terms of Service for Study Tracker — rules and guidelines for using our platform.",
};

export default function TermsPage() {
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
                    <h1 style={styles.heading}>Terms of Service</h1>
                    <p style={styles.lastUpdated}>Last updated: June 28, 2025</p>

                    <div style={styles.intro}>
                        Please read these Terms of Service carefully before using <strong>Study Tracker</strong> at <strong>seventeense.com</strong>. By accessing or using our service, you agree to be bound by these terms.
                    </div>

                    <Section title="1. Acceptance of Terms">
                        <p>By creating an account or using Study Tracker, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our service.</p>
                    </Section>

                    <Section title="2. Description of Service">
                        <p>Study Tracker is a personal learning management platform that helps users:</p>
                        <ul>
                            <li>Track study topics and learning progress.</li>
                            <li>Manage study schedules and reminders.</li>
                            <li>Integrate with Google Calendar for study reminders.</li>
                            <li>Visualize learning progress over time.</li>
                        </ul>
                    </Section>

                    <Section title="3. User Accounts">
                        <ul>
                            <li>You must provide accurate and complete information when creating an account.</li>
                            <li>You are responsible for maintaining the security of your account credentials.</li>
                            <li>You must be at least 13 years of age to use this service.</li>
                            <li>One person may not maintain more than one account.</li>
                            <li>You are responsible for all activity that occurs under your account.</li>
                        </ul>
                    </Section>

                    <Section title="4. Acceptable Use">
                        <p>You agree NOT to:</p>
                        <ul>
                            <li>Use the service for any unlawful purpose or in violation of any regulations.</li>
                            <li>Attempt to gain unauthorized access to any part of the service.</li>
                            <li>Interfere with or disrupt the integrity or performance of the service.</li>
                            <li>Upload or transmit any harmful, offensive, or malicious content.</li>
                            <li>Use the service to spam, harass, or harm other users.</li>
                            <li>Reverse engineer, decompile, or disassemble any part of the service.</li>
                        </ul>
                    </Section>

                    <Section title="5. Google Services Integration">
                        <p>Our service integrates with Google OAuth and Google Calendar. By using these features, you also agree to:</p>
                        <ul>
                            <li><a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={styles.mailLink}>Google Terms of Service</a></li>
                            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={styles.mailLink}>Google Privacy Policy</a></li>
                        </ul>
                        <p>You can revoke our access to your Google account at any time via your Google Account settings.</p>
                    </Section>

                    <Section title="6. Your Content">
                        <p>You retain full ownership of all study data, notes, and content you create on Study Tracker. By using the service, you grant us a limited license to store and display your content solely for the purpose of providing the service to you.</p>
                        <p>We do not claim ownership of your data and will not use your personal study content for any purpose other than delivering the service.</p>
                    </Section>

                    <Section title="7. Service Availability">
                        <p>We strive to maintain high availability of Study Tracker, but we do not guarantee uninterrupted access. We may:</p>
                        <ul>
                            <li>Temporarily suspend the service for maintenance or updates.</li>
                            <li>Modify or discontinue features with reasonable notice.</li>
                            <li>Limit access in cases of abuse or policy violation.</li>
                        </ul>
                    </Section>

                    <Section title="8. Intellectual Property">
                        <p>The Study Tracker platform, including its design, code, branding, and features, is owned by us and protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any part of the service without our written permission.</p>
                    </Section>

                    <Section title="9. Limitation of Liability">
                        <p>To the maximum extent permitted by law, Study Tracker shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. The service is provided &quot;as is&quot; without warranties of any kind.</p>
                    </Section>

                    <Section title="10. Termination">
                        <p>We reserve the right to suspend or terminate your account at any time if you violate these Terms. You may also delete your account at any time. Upon termination, your data will be deleted within 30 days unless required by law.</p>
                    </Section>

                    <Section title="11. Changes to Terms">
                        <p>We may update these Terms from time to time. We will notify users of significant changes via email or an in-app notification. Continued use of the service after changes constitutes acceptance of the updated Terms.</p>
                    </Section>

                    <Section title="12. Governing Law">
                        <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts in India.</p>
                    </Section>

                    <Section title="13. Contact Us">
                        <p>If you have questions about these Terms, please contact us:</p>
                        <div style={styles.contactBox}>
                            <p>📧 <strong>Email:</strong> <a href="mailto:studyforyou107@gmail.com" style={styles.mailLink}>studyforyou107@gmail.com</a></p>
                            <p>🌐 <strong>Website:</strong> <a href="https://seventeense.com" style={styles.mailLink}>seventeense.com</a></p>
                        </div>
                    </Section>

                    <div style={styles.footer}>
                        <Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link>
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
        background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
        color: "#34d399", fontSize: 11, fontFamily: "monospace",
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
        background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)",
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
