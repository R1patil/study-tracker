// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { getStats, getProgress } from "@/lib/api";
// import { createClient } from "@/lib/supabase/client";
// import StatsHeader from "@/components/StatsHeader";
// import TrackView from "@/components/TrackView";
// import TimerWidget from "@/components/TimerWidget";
// import Sidebar from "@/components/Sidebar";
// import UserMenu from "@/components/auth/UserMenu";

// export default function DashboardPage() {
//     const [stats, setStats] = useState<any>(null);
//     const [progress, setProgress] = useState<any>(null);
//     const [activeTrack, setActiveTrack] = useState("system_design");
//     const [loading, setLoading] = useState(true);
//     const [user, setUser] = useState<any>(null);
//     const [apiError, setApiError] = useState(false);

//     const supabase = createClient();

//     const refresh = useCallback(async () => {
//         try {
//             const [s, p] = await Promise.all([getStats(), getProgress()]);
//             setStats(s);
//             setProgress(p);
//             setApiError(false);
//         } catch {
//             setApiError(true);
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         supabase.auth.getUser().then(({ data }) => setUser(data.user));
//         refresh();
//     }, [refresh]);

//     if (loading) {
//         return (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
//                 <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
//                 <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>Loading your progress...</p>
//                 <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//             </div>
//         );
//     }

//     if (apiError || !stats) {
//         return (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
//                 <p style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 14 }}>⚠ Cannot reach backend</p>
//                 <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>
//                     Run: <code style={{ color: "#f59e0b" }}>uvicorn main:app --reload</code> in backend folder
//                 </p>
//                 <button onClick={refresh} style={{ marginTop: 8, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div style={{ display: "flex", minHeight: "100vh" }}>
//             <Sidebar tracks={stats.tracks} activeTrack={activeTrack} onSelect={setActiveTrack} />

//             <main style={{ flex: 1, marginLeft: 256, display: "flex", flexDirection: "column", maxWidth: "calc(100vw - 256px)" }}>
//                 {/* Top bar */}
//                 <div style={{
//                     display: "flex", alignItems: "center", justifyContent: "flex-end",
//                     padding: "16px 32px", borderBottom: "1px solid var(--border)",
//                     background: "var(--surface)", position: "sticky", top: 0, zIndex: 40,
//                 }}>
//                     {user && <UserMenu user={user} />}
//                 </div>

//                 {/* Content */}
//                 <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
//                     <StatsHeader stats={stats} />
//                     <TimerWidget onSessionEnd={refresh} />
//                     {progress && (
//                         <TrackView
//                             trackKey={activeTrack}
//                             track={progress.topics[activeTrack]}
//                             stats={stats.tracks[activeTrack]}
//                             onUpdate={refresh}
//                         />
//                     )}
//                 </div>
//             </main>
//         </div>
//     );
// }




// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { getStats, getProgress } from "@/lib/api";
// import { createClient } from "@/lib/supabase/client";
// import StatsHeader from "@/components/StatsHeader";
// import TrackView from "@/components/TrackView";
// import TimerWidget from "@/components/TimerWidget";
// import Sidebar from "@/components/Sidebar";
// import UserMenu from "@/components/auth/UserMenu";
// import ReviewToday from "@/components/ReviewToday";

// export default function DashboardPage() {
//     const [stats, setStats] = useState<any>(null);
//     const [progress, setProgress] = useState<any>(null);
//     const [activeTrack, setActiveTrack] = useState("system_design");
//     const [loading, setLoading] = useState(true);
//     const [user, setUser] = useState<any>(null);
//     const [apiError, setApiError] = useState(false);

//     const supabase = createClient();

//     const refresh = useCallback(async () => {
//         try {
//             const [s, p] = await Promise.all([getStats(), getProgress()]);
//             setStats(s);
//             setProgress(p);
//             setApiError(false);
//         } catch {
//             setApiError(true);
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         supabase.auth.getUser().then(({ data }) => setUser(data.user));
//         refresh();
//     }, [refresh]);

//     if (loading) {
//         return (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
//                 <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
//                 <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>Loading your progress...</p>
//                 <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//             </div>
//         );
//     }

//     if (apiError || !stats) {
//         return (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
//                 <p style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 14 }}>⚠ Cannot reach backend</p>
//                 <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>
//                     Run: <code style={{ color: "#f59e0b" }}>uvicorn main:app --reload</code> in backend folder
//                 </p>
//                 <button onClick={refresh} style={{ marginTop: 8, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div style={{ display: "flex", minHeight: "100vh" }}>
//             <Sidebar tracks={stats.tracks} activeTrack={activeTrack} onSelect={setActiveTrack} />

//             <main style={{ flex: 1, marginLeft: 256, display: "flex", flexDirection: "column", maxWidth: "calc(100vw - 256px)" }}>
//                 {/* Top bar */}
//                 <div style={{
//                     display: "flex", alignItems: "center", justifyContent: "flex-end",
//                     padding: "16px 32px", borderBottom: "1px solid var(--border)",
//                     background: "var(--surface)", position: "sticky", top: 0, zIndex: 40,
//                 }}>
//                     {user && <UserMenu user={user} />}
//                 </div>

//                 {/* Content */}
//                 <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
//                     <StatsHeader stats={stats} />
//                     <ReviewToday />
//                     <TimerWidget onSessionEnd={refresh} />
//                     {progress && (
//                         <TrackView
//                             trackKey={activeTrack}
//                             track={progress.topics[activeTrack]}
//                             stats={stats.tracks[activeTrack]}
//                             onUpdate={refresh}
//                         />
//                     )}
//                 </div>
//             </main>
//         </div>
//     );
// }



// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { getStats, getProgress } from "@/lib/api";
// import { createClient } from "@/lib/supabase/client";
// import { loadCustomTracks, getCustomTrackStats, CustomTrack } from "@/lib/custom-tracks";
// import StatsHeader from "@/components/StatsHeader";
// import TrackView from "@/components/TrackView";
// import TimerWidget from "@/components/TimerWidget";
// import Sidebar from "@/components/Sidebar";
// import UserMenu from "@/components/auth/UserMenu";
// import ReviewToday from "@/components/ReviewToday";
// import CustomTrackView from "@/components/CustomTrackView";

// export default function DashboardPage() {
//     const [stats, setStats] = useState<any>(null);
//     const [progress, setProgress] = useState<any>(null);
//     const [activeTrack, setActiveTrack] = useState("system_design");
//     const [loading, setLoading] = useState(true);
//     const [user, setUser] = useState<any>(null);
//     const [apiError, setApiError] = useState(false);
//     const [customTracks, setCustomTracks] = useState<CustomTrack[]>([]);
//     const [userId, setUserId] = useState<string | null>(null);

//     const supabase = createClient();

//     const refreshCustomTracks = useCallback((uid: string) => {
//         setCustomTracks(loadCustomTracks(uid));
//     }, []);

//     const refresh = useCallback(async () => {
//         try {
//             const [s, p] = await Promise.all([getStats(), getProgress()]);
//             setStats(s);
//             setProgress(p);
//             setApiError(false);
//         } catch {
//             setApiError(true);
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         supabase.auth.getUser().then(({ data }) => {
//             setUser(data.user);
//             if (data.user) {
//                 setUserId(data.user.id);
//                 refreshCustomTracks(data.user.id);
//             }
//         });
//         refresh();
//     }, [refresh]);

//     // Build sidebar track data including custom tracks
//     const allTracksForSidebar = stats ? {
//         ...stats.tracks,
//         ...Object.fromEntries(
//             customTracks.map(ct => [ct.id, getCustomTrackStats(ct)])
//         ),
//     } : null;

//     const isCustomTrack = activeTrack.startsWith("custom_");

//     if (loading) {
//         return (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
//                 <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
//                 <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>Loading your progress...</p>
//                 <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//             </div>
//         );
//     }

//     if (apiError || !stats) {
//         return (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
//                 <p style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 14 }}>⚠ Cannot reach backend</p>
//                 <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>
//                     Run: <code style={{ color: "#f59e0b" }}>uvicorn main:app --reload</code> in backend folder
//                 </p>
//                 <button onClick={refresh} style={{ marginTop: 8, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div style={{ display: "flex", minHeight: "100vh" }}>
//             <Sidebar
//                 tracks={allTracksForSidebar}
//                 activeTrack={activeTrack}
//                 onSelect={setActiveTrack}
//                 customTracks={customTracks}
//             />

//             <main style={{ flex: 1, marginLeft: 256, display: "flex", flexDirection: "column", maxWidth: "calc(100vw - 256px)" }}>
//                 {/* Top bar */}
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "14px 32px", borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 40 }}>
//                     {user && <UserMenu user={user} />}
//                 </div>

//                 {/* Content */}
//                 <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
//                     <StatsHeader stats={stats} />
//                     <ReviewToday />
//                     <TimerWidget onSessionEnd={refresh} />

//                     {/* Default tracks */}
//                     {!isCustomTrack && progress && (
//                         <TrackView
//                             trackKey={activeTrack}
//                             track={progress.topics[activeTrack]}
//                             stats={stats.tracks[activeTrack]}
//                             onUpdate={refresh}
//                         />
//                     )}

//                     {/* Custom tracks */}
//                     {isCustomTrack && userId && (
//                         <CustomTrackView
//                             track={customTracks.find(t => t.id === activeTrack)!}
//                             userId={userId}
//                             onUpdate={() => refreshCustomTracks(userId)}
//                         />
//                     )}
//                 </div>
//             </main>
//         </div>
//     );
// }



"use client";
import { useEffect, useState, useCallback } from "react";
import { getStats, getProgress } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { loadCustomTracks, getCustomTrackStats, CustomTrack } from "@/lib/custom-tracks";
import StatsHeader from "@/components/StatsHeader";
import TrackView from "@/components/TrackView";
import TimerWidget from "@/components/TimerWidget";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/auth/UserMenu";
import ReviewToday from "@/components/ReviewToday";
import CustomTrackView from "@/components/CustomTrackView";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [activeTrack, setActiveTrack] = useState("system_design");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [apiError, setApiError] = useState(false);
    const [customTracks, setCustomTracks] = useState<CustomTrack[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    const refreshCustomTracks = useCallback((uid: string) => {
        const tracks = loadCustomTracks(uid);
        setCustomTracks(tracks);

        // If current active custom track was deleted, reset selection
        if (tracks.length === 0 || !tracks.find(t => t.id === activeTrack)) {
            setActiveTrack("system_design");
        }
    }, [activeTrack]);

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
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            if (data.user) {
                setUserId(data.user.id);
                refreshCustomTracks(data.user.id);
            }
        });
        refresh();
    }, [refresh, refreshCustomTracks]);

    const allTracksForSidebar = stats ? {
        ...stats.tracks,
        ...Object.fromEntries(
            customTracks.map(ct => [ct.id, getCustomTrackStats(ct)])
        ),
    } : null;

    const isCustomTrack = activeTrack.startsWith("custom_");
    const selectedCustomTrack = customTracks.find(t => t.id === activeTrack);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>
                    Loading your progress...
                </p>
            </div>
        );
    }

    if (apiError || !stats) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
                <p style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 14 }}>
                    ⚠ Cannot reach backend
                </p>
                <button onClick={refresh}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>

            <Sidebar
                tracks={allTracksForSidebar}
                activeTrack={activeTrack}
                onSelect={setActiveTrack}
                customTracks={customTracks}
            />

            <main style={{ flex: 1, marginLeft: 256, display: "flex", flexDirection: "column" }}>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "14px 32px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface)"
                }}>
                    {user && <UserMenu user={user} />}
                </div>

                <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>

                    <StatsHeader stats={stats} />
                    <ReviewToday />
                    <TimerWidget onSessionEnd={refresh} />

                    {/* Default tracks */}
                    {!isCustomTrack && progress && (
                        <TrackView
                            trackKey={activeTrack}
                            track={progress.topics[activeTrack]}
                            stats={stats.tracks[activeTrack]}
                            onUpdate={refresh}
                        />
                    )}

                    {/* Custom tracks */}
                    {isCustomTrack && userId && selectedCustomTrack && (
                        <CustomTrackView
                            track={selectedCustomTrack}
                            userId={userId}
                            onUpdate={() => refreshCustomTracks(userId)}
                        />
                    )}

                    {/* Empty state */}
                    {isCustomTrack && !selectedCustomTrack && (
                        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
                            No custom track selected.
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}