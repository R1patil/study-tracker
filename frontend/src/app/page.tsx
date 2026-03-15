"use client";
import { useEffect, useState, useCallback } from "react";
import { getStats, getProgress } from "@/lib/api";
import StatsHeader from "@/components/StatsHeader";
import TrackView from "@/components/TrackView";
import TimerWidget from "@/components/TimerWidget";
import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [activeTrack, setActiveTrack] = useState<string>("system_design");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([getStats(), getProgress()]);
      setStats(s);
      setProgress(p);
    } catch {
      // backend not running yet
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "2px solid #6366f1", borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
          }} />
          <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>
            Connecting to backend...
          </p>
          <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 11, marginTop: 4 }}>
            Make sure FastAPI is running on :8000
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
        <p style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 14 }}>⚠ Cannot reach backend</p>
        <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>Run: <code style={{ color: "#f59e0b" }}>uvicorn main:app --reload</code> in the backend folder</p>
        <button onClick={refresh} style={{ marginTop: 8, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar tracks={stats.tracks} activeTrack={activeTrack} onSelect={setActiveTrack} />

      <main style={{ flex: 1, marginLeft: 256, padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "calc(100vw - 256px)" }}>
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
      </main>
    </div>
  );
}