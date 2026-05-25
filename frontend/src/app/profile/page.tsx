"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, updateProfile } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        github: "",
        linkedin: "",
        website: "",
        resume_url: "",
        summary: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            if (data.user) {
                fetchProfile();
            } else {
                setLoading(false);
            }
        });
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setToken(data.session.access_token);
            }
        });
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                email: data.email || "",
                phone: data.phone || "",
                github: data.github || "",
                linkedin: data.linkedin || "",
                website: data.website || "",
                resume_url: data.resume_url || "",
                summary: data.summary || ""
            });
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
            setMessage({ text: "Profile updated successfully! ⚡", type: "success" });
            setTimeout(() => setMessage(null), 4000);
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to save profile. Please try again.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

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
                <p className="text-text-secondary text-center max-w-sm">Please log in to your Study Tracker account to manage your profile.</p>
                <Link href="/login" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
                    Log In
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg text-text-primary flex flex-col pb-16">
            {/* Header */}
            <header className="border-b border-border bg-surface px-8 py-4 sticky top-0 z-40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-text-secondary hover:text-text-primary text-sm font-mono transition">
                        &larr; Dashboard
                    </Link>
                    <div className="w-[1px] h-5 bg-border" />
                    <div className="flex items-center gap-2">
                        <span className="text-xl">👤</span>
                        <h1 className="font-bold text-lg">My Autofill Profile</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl w-full mx-auto px-6 mt-8 flex flex-col md:flex-row gap-8">
                {/* Profile Form */}
                <form onSubmit={handleSave} className="flex-1 bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col gap-6 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                        Autofill Information
                    </h2>

                    {message && (
                        <div className={`p-4 rounded-xl border font-medium text-sm ${
                            message.type === "success" 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Section: Personal */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-1">
                            Personal Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-text-secondary font-medium">First Name</label>
                                <input
                                    type="text"
                                    value={profile.first_name}
                                    onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                                    className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition"
                                    placeholder="Jane"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-text-secondary font-medium">Last Name</label>
                                <input
                                    type="text"
                                    value={profile.last_name}
                                    onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                                    className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-text-secondary font-medium">Email Address</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                                    className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition"
                                    placeholder="jane.doe@example.com"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-text-secondary font-medium">Phone Number</label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition"
                                    placeholder="+1 (555) 019-2834"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Professional Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-1">
                            Links & Profiles
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-text-secondary font-medium">GitHub Profile URL</label>
                            <input
                                type="url"
                                value={profile.github}
                                onChange={e => setProfile({ ...profile, github: e.target.value })}
                                className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition"
                                placeholder="https://github.com/janedoe"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-text-secondary font-medium">LinkedIn Profile URL</label>
                            <input
                                type="url"
                                value={profile.linkedin}
                                onChange={e => setProfile({ ...profile, linkedin: e.target.value })}
                                className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition"
                                placeholder="https://linkedin.com/in/janedoe"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-text-secondary font-medium">Personal Website / Portfolio URL</label>
                            <input
                                type="url"
                                value={profile.website}
                                onChange={e => setProfile({ ...profile, website: e.target.value })}
                                className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition"
                                placeholder="https://janedoe.dev"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-text-secondary font-medium">Hosted Resume PDF URL</label>
                            <input
                                type="url"
                                value={profile.resume_url}
                                onChange={e => setProfile({ ...profile, resume_url: e.target.value })}
                                className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition"
                                placeholder="https://drive.google.com/uc?export=download&id=..."
                            />
                            <p className="text-[10px] text-text-secondary font-mono leading-relaxed mt-0.5">
                                Tip: Use a direct download link (e.g. Google Drive with export parameter or public URL) so the browser extension can download and auto-attach the file to forms.
                            </p>
                        </div>
                    </div>

                    {/* Section: Bio / Summary */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xs font-mono tracking-wider uppercase text-text-secondary border-b border-border pb-1">
                            Executive Summary / Bio
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-text-secondary font-medium">About Yourself / Short Bio</label>
                            <textarea
                                value={profile.summary}
                                onChange={e => setProfile({ ...profile, summary: e.target.value })}
                                className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-indigo-500 transition min-h-[100px] resize-y"
                                placeholder="Ambitious software engineer with 2+ years of experience building scalable backend APIs and high-performance user interfaces..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-500/20 active:translate-y-[1px]"
                    >
                        {saving ? "Saving Changes..." : "Save Profile Details ⚡"}
                    </button>
                </form>

                {/* Info & Chrome Extension Card */}
                <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-6">
                    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-xl">
                            🔌
                        </div>
                        <h3 className="font-bold text-base">Setup Chrome Extension</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Autofill job application forms instantly with your saved profile.
                        </p>
                        
                        <div className="flex flex-col gap-3 font-mono text-[11px] mt-2">
                            <div className="flex gap-2">
                                <span className="text-indigo-400">1.</span>
                                <span>Go to Chrome Settings &rarr; Extensions</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-indigo-400">2.</span>
                                <span>Enable **Developer Mode** (top-right toggle)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-indigo-400">3.</span>
                                <span>Click **Load unpacked** (top-left button)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-indigo-400">4.</span>
                                <span>Select folder: `/chrome-extension/`</span>
                            </div>
                        </div>

                        <div className="bg-bg border border-border rounded-xl p-3 text-[11px] font-mono leading-relaxed mt-2 text-text-secondary">
                            <span className="text-indigo-400 font-bold block mb-1">Supported Platforms</span>
                            Greenhouse, Lever, and Workday application pages.
                        </div>
                    </div>

                    {token && (
                        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 mt-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-xl">
                                🔑
                            </div>
                            <h3 className="font-bold text-base">Manual Connection</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                If the extension shows "Disconnected", copy this token and paste it into the manual box in the extension popup.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(token);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                                {copied ? "✓ Copied!" : "Copy Autofill Token"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
