"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, updateProfile } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

// All fields the backend now accepts
const EMPTY_PROFILE = {
    // Personal
    first_name: "", last_name: "", email: "", phone: "",
    gender: "", date_of_birth: "",
    // Address
    address_line1: "", address_line2: "", city: "", state: "", zip_code: "", country: "India",
    // Online
    github: "", linkedin: "", website: "", resume_url: "", portfolio: "", twitter: "",
    // Summary
    summary: "", cover_letter_template: "", why_this_company: "",
    // Work Auth
    work_authorization_india: "Yes - Indian Citizen", require_visa_sponsorship: "No",
    willing_to_relocate: "Yes", willing_to_travel: "Yes", travel_percentage: "25",
    // Employment
    job_type: "Full-time", work_mode_preference: "Hybrid",
    notice_period_days: "30", notice_period_text: "30 days",
    availability_to_join: "", earliest_start_date: "",
    // Compensation
    current_ctc: "", expected_ctc: "", salary_currency: "INR",
    // Experience
    total_years_experience: "", experience_level: "", currently_employed: "Yes",
    current_job_title: "", current_company: "", current_company_location: "",
    current_employment_start: "", current_job_description: "",
    previous_job_1_title: "", previous_job_1_company: "",
    previous_job_1_location: "", previous_job_1_start: "", previous_job_1_end: "",
    previous_job_1_description: "",
    // Education
    highest_degree: "", major: "", university: "", college_name: "",
    graduation_year: "", cgpa: "", percentage: "",
    // Skills
    skills_text: "", primary_skill: "",
    years_python: "", years_javascript: "", years_nodejs: "", years_react: "",
    // Certifications / Projects
    certifications_text: "", projects_text: "",
    english_proficiency: "Professional - Full Professional",
    // Referral
    referral_source: "LinkedIn", referral_person_name: "",
    // Behavioral
    why_leaving_current_job: "", biggest_achievement: "",
    where_do_you_see_yourself: "", strengths: "", weaknesses: "",
    describe_yourself: "", biggest_challenge: "",
    leadership_example: "", conflict_resolution: "", teamwork_example: "",
};

// Helper: completeness % over the key required fields
const REQUIRED_FIELDS = [
    "first_name","last_name","email","phone","address_line1","city","state","zip_code","country",
    "linkedin","github","resume_url","current_job_title","current_company","total_years_experience",
    "highest_degree","university","graduation_year","cgpa","summary","skills_text",
    "expected_ctc","current_ctc","notice_period_text","willing_to_relocate","work_authorization_india",
    "why_leaving_current_job","strengths","biggest_achievement","where_do_you_see_yourself",
];

function calcCompleteness(p: Record<string,string>) {
    const filled = REQUIRED_FIELDS.filter(f => p[f] && p[f].trim() !== "").length;
    return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-medium">
                {label} {required && <span className="text-rose-400">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputCls = "bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition placeholder:text-text-secondary/40";
const textareaCls = inputCls + " min-h-[90px] resize-y";

export default function ProfilePage() {
    const [profile, setProfile] = useState<Record<string, string>>(EMPTY_PROFILE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [activeSection, setActiveSection] = useState("personal");

    const supabase = createClient();

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setProfile(p => ({ ...p, [key]: e.target.value }));

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            if (data.user) fetchProfile();
            else setLoading(false);
        });
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setToken(data.session.access_token);
        });
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile({ ...EMPTY_PROFILE, ...Object.fromEntries(Object.entries(data).filter(([, v]) => typeof v === "string")) });
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await updateProfile(profile);
            setMessage({ text: "Profile saved! Extension will now fill more fields automatically. ⚡", type: "success" });
            setTimeout(() => setMessage(null), 5000);
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to save. Please try again.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const pct = calcCompleteness(profile);
    const missing = REQUIRED_FIELDS.filter(f => !profile[f] || profile[f].trim() === "");
    const pctColor = pct < 40 ? "#ef4444" : pct < 80 ? "#f59e0b" : "#10b981";

    const sections = [
        { id: "personal", label: "👤 Personal" },
        { id: "address", label: "📍 Address" },
        { id: "links", label: "🔗 Links" },
        { id: "experience", label: "💼 Experience" },
        { id: "education", label: "🎓 Education" },
        { id: "skills", label: "⚡ Skills" },
        { id: "compensation", label: "💰 Salary" },
        { id: "behavioral", label: "🧠 Behavioral" },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-bg text-text-primary">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-mono text-sm text-text-secondary">Loading profile data...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-bg text-text-primary p-6">
                <div className="text-5xl">🔒</div>
                <h1 className="font-bold text-2xl">Access Denied</h1>
                <p className="text-text-secondary text-center max-w-sm">Please log in to manage your profile.</p>
                <Link href="/login" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">Log In</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg text-text-primary flex flex-col pb-16">
            {/* Header */}
            <header className="border-b border-border bg-surface px-8 py-4 sticky top-0 z-40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-text-secondary hover:text-text-primary text-sm font-mono transition">
                        ← Dashboard
                    </Link>
                    <div className="w-[1px] h-5 bg-border" />
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <h1 className="font-bold text-lg">Jarvis Profile</h1>
                        <span className="text-xs font-mono text-text-secondary ml-1">— fills all ATS forms automatically</span>
                    </div>
                </div>
                {/* Completeness pill */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1">
                        <div className="w-16 h-1.5 bg-bg rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pctColor }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: pctColor }}>{pct}%</span>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl w-full mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-6">
                {/* LEFT: Section Nav + Completeness */}
                <div className="w-full lg:w-56 shrink-0 flex flex-col gap-4">
                    {/* Completeness Card */}
                    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">Profile</span>
                            <span className="text-sm font-bold" style={{ color: pctColor }}>{pct}%</span>
                        </div>
                        <div className="h-2 bg-bg rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pctColor }} />
                        </div>
                        {missing.length > 0 && (
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-[10px] font-mono text-text-secondary">Missing fields:</span>
                                {missing.slice(0, 6).map(f => (
                                    <span key={f} className="text-[10px] text-amber-400 font-mono">⚠ {f.replace(/_/g, " ")}</span>
                                ))}
                                {missing.length > 6 && <span className="text-[10px] text-text-secondary font-mono">+{missing.length - 6} more</span>}
                            </div>
                        )}
                        {pct === 100 && <span className="text-[11px] text-emerald-400 font-medium">✓ All required fields filled!</span>}
                    </div>

                    {/* Section Nav */}
                    <nav className="bg-surface border border-border rounded-2xl p-2 flex flex-col gap-0.5">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                    setActiveSection(s.id);
                                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                                    activeSection === s.id
                                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </nav>

                    {/* Token Card */}
                    {token && (
                        <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3">
                            <div className="text-xl">🔑</div>
                            <div className="text-xs font-bold">Extension Token</div>
                            <p className="text-[10px] text-text-secondary leading-relaxed">
                                If extension shows "Disconnected", paste this token in the popup.
                            </p>
                            <button
                                type="button"
                                onClick={() => { navigator.clipboard.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                                {copied ? "✓ Copied!" : "Copy Token"}
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT: The Form */}
                <form onSubmit={handleSave} className="flex-1 flex flex-col gap-6">

                    {message && (
                        <div className={`p-4 rounded-xl border font-medium text-sm ${
                            message.type === "success"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* ── PERSONAL ── */}
                    <section id="personal" className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 scroll-mt-20">
                        <h2 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-2">
                            👤 Personal Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="First Name" required><input className={inputCls} value={profile.first_name} onChange={set("first_name")} placeholder="Rahul" /></Field>
                            <Field label="Last Name" required><input className={inputCls} value={profile.last_name} onChange={set("last_name")} placeholder="Patil" /></Field>
                            <Field label="Email Address" required><input type="email" className={inputCls} value={profile.email} onChange={set("email")} placeholder="rahul@example.com" /></Field>
                            <Field label="Phone Number" required><input type="tel" className={inputCls} value={profile.phone} onChange={set("phone")} placeholder="+91-9999999999" /></Field>
                            <Field label="Gender">
                                <select className={inputCls} value={profile.gender} onChange={set("gender")}>
                                    <option value="">Select...</option>
                                    <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to disclose</option>
                                </select>
                            </Field>
                            <Field label="Willing to Relocate?">
                                <select className={inputCls} value={profile.willing_to_relocate} onChange={set("willing_to_relocate")}>
                                    <option>Yes</option><option>No</option><option>Open to discussion</option>
                                </select>
                            </Field>
                        </div>
                    </section>

                    {/* ── ADDRESS ── */}
                    <section id="address" className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 scroll-mt-20">
                        <h2 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-2">
                            📍 Address — Required by Workday &amp; iCIMS
                        </h2>
                        <Field label="Street Address / Flat No." required>
                            <input className={inputCls} value={profile.address_line1} onChange={set("address_line1")} placeholder="Flat 5, Sunrise Apartments, MG Road" />
                        </Field>
                        <Field label="Address Line 2 (Area / Landmark)">
                            <input className={inputCls} value={profile.address_line2} onChange={set("address_line2")} placeholder="Near City Mall, Kothrud" />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="City" required><input className={inputCls} value={profile.city} onChange={set("city")} placeholder="Pune" /></Field>
                            <Field label="State" required><input className={inputCls} value={profile.state} onChange={set("state")} placeholder="Maharashtra" /></Field>
                            <Field label="ZIP / PIN Code" required><input className={inputCls} value={profile.zip_code} onChange={set("zip_code")} placeholder="411038" /></Field>
                        </div>
                        <Field label="Country" required>
                            <select className={inputCls} value={profile.country} onChange={set("country")}>
                                <option>India</option><option>United States</option><option>United Kingdom</option>
                                <option>Canada</option><option>Germany</option><option>Singapore</option><option>Australia</option>
                            </select>
                        </Field>
                    </section>

                    {/* ── LINKS ── */}
                    <section id="links" className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 scroll-mt-20">
                        <h2 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-2">
                            🔗 Links &amp; Profiles
                        </h2>
                        <Field label="GitHub URL" required><input type="url" className={inputCls} value={profile.github} onChange={set("github")} placeholder="https://github.com/R1patil" /></Field>
                        <Field label="LinkedIn URL" required><input type="url" className={inputCls} value={profile.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/rahul-patil" /></Field>
                        <Field label="Portfolio / Website"><input type="url" className={inputCls} value={profile.website} onChange={set("website")} placeholder="https://rahulpatil.dev" /></Field>
                        <Field label="Resume PDF URL (Direct Download)" required>
                            <input type="url" className={inputCls} value={profile.resume_url} onChange={set("resume_url")} placeholder="https://drive.google.com/uc?export=download&id=..." />
                            <p className="text-[10px] text-text-secondary font-mono leading-relaxed">Use a direct download link so the extension can auto-attach your resume PDF to file upload fields.</p>
                        </Field>
                        <Field label="Summary / Short Bio" required>
                            <textarea className={textareaCls} value={profile.summary} onChange={set("summary")} placeholder="Backend Engineer with 2+ years experience building scalable APIs..." />
                        </Field>
                    </section>

                    {/* ── EXPERIENCE ── */}
                    <section id="experience" className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 scroll-mt-20">
                        <h2 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-2">
                            💼 Work Experience
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Current Job Title" required>
                                <input className={inputCls} value={profile.current_job_title} onChange={set("current_job_title")} placeholder="Backend Engineer" />
                            </Field>
                            <Field label="Current Company" required>
                                <input className={inputCls} value={profile.current_company} onChange={set("current_company")} placeholder="Raysoft AI" />
                            </Field>
                            <Field label="Total Years of Experience" required>
                                <input type="number" min="0" max="50" className={inputCls} value={profile.total_years_experience} onChange={set("total_years_experience")} placeholder="2" />
                            </Field>
                            <Field label="Notice Period">
                                <input className={inputCls} value={profile.notice_period_text} onChange={set("notice_period_text")} placeholder="30 days" />
                            </Field>
                            <Field label="Employment Start Date">
                                <input type="month" className={inputCls} value={profile.current_employment_start} onChange={set("current_employment_start")} />
                            </Field>
                            <Field label="Work Mode Preference">
                                <select className={inputCls} value={profile.work_mode_preference} onChange={set("work_mode_preference")}>
                                    <option>Hybrid</option><option>Remote</option><option>On-site</option>
                                </select>
                            </Field>
                            <Field label="Work Authorization (India)">
                                <select className={inputCls} value={profile.work_authorization_india} onChange={set("work_authorization_india")}>
                                    <option>Yes - Indian Citizen</option><option>Yes - Valid Work Permit</option><option>No</option>
                                </select>
                            </Field>
                            <Field label="Require Visa Sponsorship?">
                                <select className={inputCls} value={profile.require_visa_sponsorship} onChange={set("require_visa_sponsorship")}>
                                    <option>No</option><option>Yes</option>
                                </select>
                            </Field>
                        </div>
                        <Field label="Current Job Description (bullet points)">
                            <textarea className={textareaCls} value={profile.current_job_description} onChange={set("current_job_description")} placeholder="• Built REST APIs with FastAPI serving 100k+ requests/day&#10;• Migrated legacy PostgreSQL schema to pgvector for semantic search" />
                        </Field>
                        <div className="mt-2 border-t border-border pt-4">
                            <p className="text-xs font-mono text-text-secondary mb-3">Previous Job (optional)</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Previous Job Title"><input className={inputCls} value={profile.previous_job_1_title} onChange={set("previous_job_1_title")} placeholder="SWE Intern" /></Field>
                                <Field label="Previous Company"><input className={inputCls} value={profile.previous_job_1_company} onChange={set("previous_job_1_company")} placeholder="TechStartup Inc." /></Field>
                                <Field label="Start Date"><input type="month" className={inputCls} value={profile.previous_job_1_start} onChange={set("previous_job_1_start")} /></Field>
                                <Field label="End Date"><input type="month" className={inputCls} value={profile.previous_job_1_end} onChange={set("previous_job_1_end")} /></Field>
                            </div>
                        </div>
                    </section>

                    {/* ── EDUCATION ── */}
                    <section id="education" className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 scroll-mt-20">
                        <h2 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-2">
                            🎓 Education
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Highest Degree" required>
                                <select className={inputCls} value={profile.highest_degree} onChange={set("highest_degree")}>
                                    <option value="">Select...</option>
                                    <option>Bachelor of Engineering</option><option>Bachelor of Technology</option>
                                    <option>Bachelor of Science</option><option>Master of Technology</option>
                                    <option>Master of Science</option><option>MBA</option><option>PhD</option><option>Diploma</option>
                                </select>
                            </Field>
                            <Field label="Major / Field of Study" required>
                                <input className={inputCls} value={profile.major} onChange={set("major")} placeholder="Computer Engineering" />
                            </Field>
                            <Field label="University / Institution" required>
                                <input className={inputCls} value={profile.university} onChange={set("university")} placeholder="Savitribai Phule Pune University" />
                            </Field>
                            <Field label="College Name">
                                <input className={inputCls} value={profile.college_name} onChange={set("college_name")} placeholder="VIT Pune" />
                            </Field>
                            <Field label="Graduation Year" required>
                                <input type="number" min="1990" max="2030" className={inputCls} value={profile.graduation_year} onChange={set("graduation_year")} placeholder="2024" />
                            </Field>
                            <Field label="CGPA / GPA" required>
                                <input className={inputCls} value={profile.cgpa} onChange={set("cgpa")} placeholder="8.2 (out of 10)" />
                            </Field>
                            <Field label="Percentage">
                                <input className={inputCls} value={profile.percentage} onChange={set("percentage")} placeholder="82%" />
                            </Field>
                        </div>
                    </section>

                    {/* ── SKILLS ── */}
                    <section id="skills" className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 scroll-mt-20">
                        <h2 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-2">
                            ⚡ Skills &amp; Technologies
                        </h2>
                        <Field label="Skills (comma separated)" required>
                            <textarea className={textareaCls} value={profile.skills_text} onChange={set("skills_text")} placeholder="Python, FastAPI, Node.js, TypeScript, PostgreSQL, Redis, Docker, AWS, LangChain, OpenAI API, Git, REST APIs" />
                        </Field>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Field label="Years Python"><input type="number" min="0" max="30" className={inputCls} value={profile.years_python} onChange={set("years_python")} placeholder="2" /></Field>
                            <Field label="Years JS/TS"><input type="number" min="0" max="30" className={inputCls} value={profile.years_javascript} onChange={set("years_javascript")} placeholder="2" /></Field>
                            <Field label="Years Node.js"><input type="number" min="0" max="30" className={inputCls} value={profile.years_nodejs} onChange={set("years_nodejs")} placeholder="2" /></Field>
                            <Field label="Years React"><input type="number" min="0" max="30" className={inputCls} value={profile.years_react} onChange={set("years_react")} placeholder="1" /></Field>
                        </div>
                        <Field label="Certifications">
                            <input className={inputCls} value={profile.certifications_text} onChange={set("certifications_text")} placeholder="AWS Cloud Practitioner (2025), Google Cloud Associate (2024)" />
                        </Field>
                        <Field label="Projects (brief descriptions)">
                            <textarea className={textareaCls} value={profile.projects_text} onChange={set("projects_text")} placeholder="1. Jarvis OS (FastAPI, Next.js, LangChain) — AI career automation platform&#10;2. Study Tracker (FastAPI, Supabase) — Productivity tracker" />
                        </Field>
                    </section>

                    {/* ── COMPENSATION ── */}
                    <section id="compensation" className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 scroll-mt-20">
                        <h2 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-2">
                            💰 Salary &amp; Availability
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Current CTC / Salary" required>
                                <input className={inputCls} value={profile.current_ctc} onChange={set("current_ctc")} placeholder="8 LPA" />
                            </Field>
                            <Field label="Expected CTC / Salary" required>
                                <input className={inputCls} value={profile.expected_ctc} onChange={set("expected_ctc")} placeholder="12-15 LPA" />
                            </Field>
                            <Field label="Availability to Join">
                                <input className={inputCls} value={profile.availability_to_join} onChange={set("availability_to_join")} placeholder="Immediately (30-day notice)" />
                            </Field>
                            <Field label="Salary Currency">
                                <select className={inputCls} value={profile.salary_currency} onChange={set("salary_currency")}>
                                    <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option><option>SGD</option>
                                </select>
                            </Field>
                            <Field label="Referral Source">
                                <select className={inputCls} value={profile.referral_source} onChange={set("referral_source")}>
                                    <option>LinkedIn</option><option>Naukri</option><option>Indeed</option><option>Employee Referral</option>
                                    <option>Company Website</option><option>GitHub</option><option>Other</option>
                                </select>
                            </Field>
                            <Field label="Willing to Travel?">
                                <select className={inputCls} value={profile.willing_to_travel} onChange={set("willing_to_travel")}>
                                    <option>Yes</option><option>No</option><option>Up to 25%</option><option>Up to 50%</option>
                                </select>
                            </Field>
                        </div>
                    </section>

                    {/* ── BEHAVIORAL ── */}
                    <section id="behavioral" className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 scroll-mt-20">
                        <h2 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-2">
                            🧠 Behavioral Q&amp;A — Fills essay boxes automatically
                        </h2>
                        <p className="text-[11px] text-text-secondary font-mono">These are pre-filled into "Why do you want to join?", "Tell us about yourself", and other open-ended questions on all ATS platforms.</p>

                        <Field label="Why are you leaving your current job?" required>
                            <textarea className={textareaCls} value={profile.why_leaving_current_job} onChange={set("why_leaving_current_job")} placeholder="I am looking for opportunities to work on more challenging problems and contribute to a team that values engineering excellence..." />
                        </Field>
                        <Field label="Biggest Achievement" required>
                            <textarea className={textareaCls} value={profile.biggest_achievement} onChange={set("biggest_achievement")} placeholder="Built an AI-powered job autofill Chrome extension that reduces application time by 80%..." />
                        </Field>
                        <Field label="Where do you see yourself in 3-5 years?" required>
                            <textarea className={textareaCls} value={profile.where_do_you_see_yourself} onChange={set("where_do_you_see_yourself")} placeholder="I see myself as a senior backend engineer or engineering lead, architecting systems that serve millions of users..." />
                        </Field>
                        <Field label="Your Strengths" required>
                            <textarea className={textareaCls} value={profile.strengths} onChange={set("strengths")} placeholder="Problem-solving, building scalable APIs, learning new technologies quickly, and shipping high-quality code under deadlines." />
                        </Field>
                        <Field label="Your Weaknesses">
                            <textarea className={textareaCls} value={profile.weaknesses} onChange={set("weaknesses")} placeholder="I sometimes over-engineer solutions. I actively balance this by setting clear delivery milestones." />
                        </Field>
                        <Field label="Describe yourself">
                            <textarea className={textareaCls} value={profile.describe_yourself} onChange={set("describe_yourself")} placeholder="I am a backend engineer passionate about AI, automation, and building tools that improve people's productivity..." />
                        </Field>
                        <Field label="Biggest challenge you've faced">
                            <textarea className={textareaCls} value={profile.biggest_challenge} onChange={set("biggest_challenge")} placeholder="Debugging a race condition in a distributed event-driven system that only appeared under production load..." />
                        </Field>
                        <Field label="Leadership example">
                            <textarea className={textareaCls} value={profile.leadership_example} onChange={set("leadership_example")} placeholder="Led the migration of our legacy REST API to async FastAPI, coordinating across 3 engineers..." />
                        </Field>
                        <Field label="Conflict resolution example">
                            <textarea className={textareaCls} value={profile.conflict_resolution} onChange={set("conflict_resolution")} placeholder="When I disagreed with a technical decision, I prepared a benchmark comparison document..." />
                        </Field>
                    </section>

                    {/* SAVE BUTTON */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="sticky bottom-4 px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-xl shadow-indigo-500/30 active:translate-y-[1px] flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                        ) : (
                            <>⚡ Save All Profile Details</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
