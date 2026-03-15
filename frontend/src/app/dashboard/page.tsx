"use client";
import { useEffect, useState, useCallback } from "react";
import { getStats, getProgress } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import StatsHeader from "@/components/StatsHeader";
import TrackView from "@/components/TrackView";
import TimerWidget from "@/components/TimerWidget";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/auth/UserMenu";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [activeTrack, setActiveTrack] = useState("system_design");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [apiError, setApiError] = useState(false);

    const supabase = createClient();

    const refresh = useCallback(async () => {
        try {
            const [s, p] = await Promise.all([getStats(), getProgress()]);
            setStats(s);
            setProgress(p);
            setApiError(false);
        } catch {
            setApiError(true);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        refresh();
    }, [refresh]);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>Loading your progress...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (apiError || !stats) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
                <p style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 14 }}>⚠ Cannot reach backend</p>
                <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>
                    Run: <code style={{ color: "#f59e0b" }}>uvicorn main:app --reload</code> in backend folder
                </p>
                <button onClick={refresh} style={{ marginTop: 8, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar tracks={stats.tracks} activeTrack={activeTrack} onSelect={setActiveTrack} />

            <main style={{ flex: 1, marginLeft: 256, display: "flex", flexDirection: "column", maxWidth: "calc(100vw - 256px)" }}>
                {/* Top bar */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                    padding: "16px 32px", borderBottom: "1px solid var(--border)",
                    background: "var(--surface)", position: "sticky", top: 0, zIndex: 40,
                }}>
                    {user && <UserMenu user={user} />}
                </div>

                {/* Content */}
                <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <StatsHeader stats={stats} />
                    <TimerWidget onSessionEnd={refresh} />
                    {progress && (
                        <TrackView
                            trackKey={activeTrack}
                            track={progress.topics[activeTrack]}
                            stats={stats.tracks[activeTrack]}
                            onUpdate={refresh}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}