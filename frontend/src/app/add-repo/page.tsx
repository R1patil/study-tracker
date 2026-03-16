"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
    parseGitHubUrl, fetchReadme, extractTopicsWithAI,
    buildCustomTrack, loadCustomTracks, saveCustomTracks,
} from "@/lib/custom-tracks";

type Step = "input" | "fetching" | "extracting" | "preview" | "done" | "error";

const EXAMPLE_REPOS = [
    "https://github.com/jwasham/coding-interview-university",
    "https://github.com/donnemartin/system-design-primer",
    "https://github.com/ossu/computer-science",
    "https://github.com/EbookFoundation/free-programming-books",
    "https://github.com/sindresorhus/awesome",
];

export default function AddRepoPage() {
    const [url, setUrl] = useState("");
    const [step, setStep] = useState<Step>("input");
    const [error, setError] = useState("");
    const [preview, setPreview] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [topicCount, setTopicCount] = useState(0);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    const handleAdd = async () => {
        setError("");
        const parsed = parseGitHubUrl(url);
        if (!parsed) {
            setError("Invalid GitHub URL. Example: https://github.com/username/repo");
            return;
        }

        const { owner, repo } = parsed;

        // Step 1: Fetch README
        setStep("fetching");
        const readme = await fetchReadme(owner, repo);
        if (!readme) {
            setError(`Could not fetch README from ${owner}/${repo}. Make sure the repo is public.`);
            setStep("error");
            return;
        }

        // Step 2: AI extraction
        setStep("extracting");
        const repoUrl = `https://github.com/${owner}/${repo}`;
        const aiOutput = await extractTopicsWithAI(readme, repo, repoUrl);
        if (!aiOutput || !aiOutput.sections) {
            setError("AI could not extract topics. The README might be too short or in an unusual format.");
            setStep("error");
            return;
        }

        // Count total topics
        let count = 0;
        for (const section of Object.values(aiOutput.sections)) {
            count += (section as any).topics?.length || 0;
        }
        setTopicCount(count);

        // Build preview
        const existing = userId ? loadCustomTracks(userId) : [];
        const track = buildCustomTrack(owner, repo, repoUrl, aiOutput, existing.length);
        setPreview(track);
        setStep("preview");
    };

    const handleConfirm = () => {
        if (!userId || !preview) return;
        const existing = loadCustomTracks(userId);
        // Check for duplicate
        if (existing.find(t => t.repoOwner === preview.repoOwner && t.repoName === preview.repoName)) {
            setError("This repo is already added!");
            return;
        }
        saveCustomTracks(userId, [preview, ...existing]);
        setStep("done");
        setTimeout(() => router.push("/dashboard"), 2000);
    };

    const handleReset = () => {
        setStep("input");
        setError("");
        setPreview(null);
        setUrl("");
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Back */}
            <div style={{ width: "100%", maxWidth: 680, marginBottom: 24 }}>
                <Link href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: 13, fontFamily: "monospace", textDecoration: "none" }}>← Back to Dashboard</Link>
            </div>

            <div style={{ width: "100%", maxWidth: 680 }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
                    <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text-primary)", marginBottom: 8 }}>
                        Add GitHub Repo
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
                        Paste any public GitHub repo URL — AI will read the README and extract all topics with their resource links automatically.
                    </p>
                </div>

                {/* ── INPUT STEP ── */}
                {(step === "input" || step === "error") && (
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
                        <label style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", display: "block", marginBottom: 8, letterSpacing: "0.06em" }}>
                            GITHUB REPOSITORY URL
                        </label>
                        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                            <input
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAdd()}
                                placeholder="https://github.com/username/repo-name"
                                style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, fontFamily: "monospace", outline: "none", transition: "border-color 0.2s" }}
                                onFocus={e => (e.target.style.borderColor = "#6366f1")}
                                onBlur={e => (e.target.style.borderColor = "var(--border)")}
                            />
                            <button onClick={handleAdd} disabled={!url.trim()} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: url.trim() ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "var(--muted)", color: "white", fontSize: 14, fontFamily: "Syne,sans-serif", fontWeight: 700, cursor: url.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
                                Add Repo →
                            </button>
                        </div>

                        {error && (
                            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171", fontFamily: "monospace", marginBottom: 16 }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Examples */}
                        <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Try these popular repos:
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {EXAMPLE_REPOS.map((repo, i) => (
                                <button key={i} onClick={() => setUrl(repo)} style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, fontFamily: "monospace", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseEnter={e => { (e.currentTarget.style.borderColor = "#6366f1"); (e.currentTarget.style.color = "#6366f1"); }}
                                    onMouseLeave={e => { (e.currentTarget.style.borderColor = "var(--border)"); (e.currentTarget.style.color = "var(--text-secondary)"); }}
                                >
                                    {repo.replace("https://github.com/", "")}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── LOADING STEPS ── */}
                {(step === "fetching" || step === "extracting") && (
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 48, textAlign: "center" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />

                        <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>
                            {step === "fetching" ? "Fetching README..." : "AI is extracting topics..."}
                        </h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                            {step === "fetching"
                                ? "Reading the repository README from GitHub"
                                : "Groq AI is reading the README and extracting all topics with their resource links"}
                        </p>

                        {step === "extracting" && (
                            <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 8 }}>
                                {["Parsing headings", "Extracting links", "Building sections"].map((s, i) => (
                                    <span key={i} style={{ fontSize: 11, fontFamily: "monospace", padding: "4px 10px", borderRadius: 20, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1" }}>
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}

                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {/* ── PREVIEW STEP ── */}
                {step === "preview" && preview && (
                    <div>
                        {/* Success banner */}
                        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 20 }}>✅</span>
                            <div>
                                <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "#10b981" }}>AI extracted {topicCount} topics!</p>
                                <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>Review the sections below, then confirm to add to your dashboard.</p>
                            </div>
                        </div>

                        {/* Track preview card */}
                        <div style={{ background: "var(--surface)", border: `1px solid ${preview.color}33`, borderRadius: 20, padding: 24, marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${preview.color}22`, border: `1px solid ${preview.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                                    {preview.icon}
                                </div>
                                <div>
                                    <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>{preview.title}</h2>
                                    <a href={preview.source} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", textDecoration: "none" }}>
                                        {preview.source} ↗
                                    </a>
                                </div>
                            </div>

                            {/* Sections preview */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                                {Object.entries(preview.sections).slice(0, 8).map(([key, section]: [string, any]) => (
                                    <div key={key} style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                            <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{section.title}</span>
                                            <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-secondary)" }}>{section.topics?.length || 0} topics</span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                            {section.topics?.slice(0, 3).map((t: any, i: number) => (
                                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: preview.color, flexShrink: 0 }} />
                                                    <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--text-secondary)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                                        onMouseEnter={e => ((e.target as HTMLElement).style.color = preview.color)}
                                                        onMouseLeave={e => ((e.target as HTMLElement).style.color = "var(--text-secondary)")}
                                                    >{t.title}</a>
                                                </div>
                                            ))}
                                            {section.topics?.length > 3 && (
                                                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-secondary)", marginLeft: 13 }}>+{section.topics.length - 3} more...</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(preview.sections).length > 8 && (
                                    <p style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", textAlign: "center", padding: 8 }}>
                                        +{Object.keys(preview.sections).length - 8} more sections
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Confirm / Cancel */}
                        <div style={{ display: "flex", gap: 12 }}>
                            <button onClick={handleConfirm} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "white", fontSize: 15, fontFamily: "Syne,sans-serif", fontWeight: 700, cursor: "pointer" }}>
                                ✅ Add to Dashboard
                            </button>
                            <button onClick={handleReset} style={{ padding: "14px 20px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 14, fontFamily: "monospace", cursor: "pointer" }}>
                                Try Another
                            </button>
                        </div>
                    </div>
                )}

                {/* ── DONE ── */}
                {step === "done" && (
                    <div style={{ background: "var(--surface)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: 48, textAlign: "center" }}>
                        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
                        <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 8 }}>Track Added!</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Redirecting to your dashboard...</p>
                    </div>
                )}
            </div>
        </div>
    );
}