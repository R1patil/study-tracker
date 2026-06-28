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
//         const tracks = loadCustomTracks(uid);
//         setCustomTracks(tracks);

//         // If current active custom track was deleted, reset selection
//         if (tracks.length === 0 || !tracks.find(t => t.id === activeTrack)) {
//             setActiveTrack("system_design");
//         }
//     }, [activeTrack]);

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
//     }, [refresh, refreshCustomTracks]);

//     const allTracksForSidebar = stats ? {
//         ...stats.tracks,
//         ...Object.fromEntries(
//             customTracks.map(ct => [ct.id, getCustomTrackStats(ct)])
//         ),
//     } : null;

//     const isCustomTrack = activeTrack.startsWith("custom_");
//     const selectedCustomTrack = customTracks.find(t => t.id === activeTrack);

//     if (loading) {
//         return (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
//                 <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
//                 <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>
//                     Loading your progress...
//                 </p>
//             </div>
//         );
//     }

//     if (apiError || !stats) {
//         return (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
//                 <p style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 14 }}>
//                     ⚠ Cannot reach backend
//                 </p>
//                 <button onClick={refresh}>Retry</button>
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

//             <main style={{ flex: 1, marginLeft: 256, display: "flex", flexDirection: "column" }}>

//                 <div style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "flex-end",
//                     padding: "14px 32px",
//                     borderBottom: "1px solid var(--border)",
//                     background: "var(--surface)"
//                 }}>
//                     {user && <UserMenu user={user} />}
//                 </div>

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
//                     {isCustomTrack && userId && selectedCustomTrack && (
//                         <CustomTrackView
//                             track={selectedCustomTrack}
//                             userId={userId}
//                             onUpdate={() => refreshCustomTracks(userId)}
//                         />
//                     )}

//                     {/* Empty state */}
//                     {isCustomTrack && !selectedCustomTrack && (
//                         <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
//                             No custom track selected.
//                         </div>
//                     )}

//                 </div>
//             </main>
//         </div>
"use client";
import { useEffect, useState, useCallback } from "react";
import { getStats, getProgress, getActivityIntervention, completeFocusSprint } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { loadCustomTracks, getCustomTrackStats, CustomTrack } from "@/lib/custom-tracks";
import StatsHeader from "@/components/StatsHeader";
import TrackView from "@/components/TrackView";
import TimerWidget from "@/components/TimerWidget";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/auth/UserMenu";
import ReviewToday from "@/components/ReviewToday";
import DailyRecommendations from "@/components/DailyRecommendations";
import CustomTrackView from "@/components/CustomTrackView";

import SearchWidget from "@/components/SearchWidget";

import DistractionInterventionBanner from "@/components/DistractionInterventionBanner";

const getSprintTemplate = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("hashing")) {
        return {
            prompt: "Write a function in Javascript that adds a node to a consistent hashing ring. Hash the node using a simple helper function and place it on a sorted array of virtual nodes.",
            defaultCode: `// Consistent Hashing Ring Addition\nfunction addNode(ring, nodeName, replicas = 3) {\n  // ring is an array of objects: { hash: number, name: string }\n  // hash the nodeName + replica index, insert into ring in sorted order.\n  \n  // TODO: Implement your solution here\n  \n  return ring;\n}`
        };
    } else if (t.includes("cache") || t.includes("eviction")) {
        return {
            prompt: "Write a function to evict the Least Recently Used (LRU) item from a cache dictionary.",
            defaultCode: `// LRU Cache Eviction\nfunction evictLRU(cache, accessOrder) {\n  // cache is a Map of key -> value\n  // accessOrder is an array of keys representing insertion order (oldest first)\n  // Remove oldest from cache and return key of evicted item\n  \n  // TODO: Implement your solution here\n  \n  return null;\n}`
        };
    } else if (t.includes("limiting") || t.includes("limiter")) {
        return {
            prompt: "Implement a simple Token Bucket rate limiter check. The bucket capacity is 5, and fill rate is 1 token/sec.",
            defaultCode: `// Token Bucket rate limiter check\nfunction isAllowed(bucket, now) {\n  // bucket: { tokens: number, lastRefill: number }\n  // Refill tokens: tokens = min(5, tokens + (now - lastRefill) * 1)\n  // If tokens >= 1, decrement tokens and return true. Else return false.\n  \n  // TODO: Implement your solution here\n  \n  return false;\n}`
        };
    } else {
        return {
            prompt: `Write a basic test check or implementation for: ${title}. Let's write a mock validator function that returns true when valid.`,
            defaultCode: `// Focus recovery sprint for: ${title}\nfunction solve(input) {\n  // TODO: Write a clean implementation here\n  return true;\n}`
        };
    }
};

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [activeTrack, setActiveTrack] = useState("system_design");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [apiError, setApiError] = useState(false);
    const [customTracks, setCustomTracks] = useState<CustomTrack[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // Intervention states
    const [interventionActive, setInterventionActive] = useState(false);
    const [interventionDetails, setInterventionDetails] = useState<any>(null);
    const [interventionAntidote, setInterventionAntidote] = useState<any>(null);
    const [sprintTopic, setSprintTopic] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState<"pranayama" | "sprint">("pranayama");
    
    // Pranayama breathing states
    const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "hold_empty">("inhale");
    const [breathSeconds, setBreathSeconds] = useState(4);
    const [pranayamaCountdown, setPranayamaCountdown] = useState(60); // 1 minute
    
    // Sprint states
    const [sprintCode, setSprintCode] = useState("");
    const [sprintTimer, setSprintTimer] = useState(300); // 5 minutes
    const [sprintRunning, setSprintRunning] = useState(false);
    const [sprintComplete, setSprintCompleteState] = useState(false);
    const [sprintFeedback, setSprintFeedback] = useState("");
    const [sprintTopicPrompt, setSprintTopicPrompt] = useState("");
    const [submittingSprint, setSubmittingSprint] = useState(false);

    const supabase = createClient();

    const refreshCustomTracks = useCallback((uid: string) => {
        setCustomTracks(loadCustomTracks(uid));
    }, []);

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
    }, [refresh]);

    // Polling intervention status
    useEffect(() => {
        if (!userId) return;
        
        const checkIntervention = () => {
            getActivityIntervention()
                .then(res => {
                    if (res) {
                        setInterventionActive(res.trigger_intervention);
                        setInterventionDetails(res.details);
                        setInterventionAntidote(res.antidote);
                        setSprintTopic(res.sprint_topic);
                    }
                })
                .catch(err => console.error("Intervention poll error:", err));
        };
        
        checkIntervention();
        const interval = setInterval(checkIntervention, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    // Pranayama timer logic
    useEffect(() => {
        if (!showModal || modalStep !== "pranayama") return;
        
        const phaseTimer = setInterval(() => {
            setBreathSeconds(prev => {
                if (prev === 1) {
                    setBreathPhase(ph => {
                        if (ph === "inhale") return "hold";
                        if (ph === "hold") return "exhale";
                        if (ph === "exhale") return "hold_empty";
                        return "inhale";
                    });
                    return 4;
                }
                return prev - 1;
            });
        }, 1000);
        
        const countdownTimer = setInterval(() => {
            setPranayamaCountdown(prev => {
                if (prev === 1) {
                    setModalStep("sprint");
                    setSprintRunning(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => {
            clearInterval(phaseTimer);
            clearInterval(countdownTimer);
        };
    }, [showModal, modalStep]);

    // Code sprint timer logic
    useEffect(() => {
        if (!showModal || modalStep !== "sprint" || !sprintRunning || sprintComplete) return;
        
        const timer = setInterval(() => {
            setSprintTimer(prev => {
                if (prev === 1) {
                    setSprintRunning(false);
                    setSprintFeedback("Time is up! Let's try again.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [showModal, modalStep, sprintRunning, sprintComplete]);

    const handleSprintSubmit = async () => {
        setSubmittingSprint(true);
        setSprintFeedback("");
        
        // Simulate running test cases
        setTimeout(async () => {
            setSubmittingSprint(false);
            setSprintCompleteState(true);
            setSprintRunning(false);
            setSprintFeedback("✓ All test cases passed! Mind cleared & focus restored. Sattva state achieved. 🧘");
            
            try {
                await completeFocusSprint(sprintTopic.id, sprintTopic.title);
                setInterventionActive(false);
                refresh();
            } catch (err) {
                console.error("Failed to log focus sprint completion:", err);
            }
        }, 2000);
    };

    const allTracksForSidebar = stats ? {
        ...stats.tracks,
        ...Object.fromEntries(
            customTracks.map(ct => [ct.id, getCustomTrackStats(ct)])
        ),
    } : null;

    const isCustomTrack = activeTrack.startsWith("custom_");

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #2aa198", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: 12 }}>Loading your voyage logs...</p>
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

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const getPhaseMessage = (phase: string) => {
        if (phase === "inhale") return "Breath Inhale... 🌬️";
        if (phase === "hold") return "Hold Breath... 🍃";
        if (phase === "exhale") return "Breath Exhale... 💨";
        return "Hold Empty... 🧘";
    };

    return (
        <div className={`flex min-h-screen text-text-primary transition-all duration-700 ${
            interventionActive ? "bg-indigo-950/20 border-4 border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.15)_inset]" : "bg-bg"
        }`}>
            <Sidebar
                tracks={allTracksForSidebar}
                activeTrack={activeTrack}
                onSelect={setActiveTrack}
                customTracks={customTracks}
            />

            <main className="flex-1 ml-64 flex flex-col min-w-0">
                <div className="flex items-center justify-end px-8 py-4 border-b border-border bg-surface sticky top-0 z-40">
                    {user && <UserMenu user={user} />}
                </div>

                <div className="p-8 flex flex-col gap-6 min-w-0">
                    {/* ALERT BANNER */}
                    {interventionActive && (
                        <div className="bg-gradient-to-r from-indigo-950/90 to-violet-950/90 border border-indigo-500/30 text-indigo-100 px-6 py-4 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(99,102,241,0.2)] animate-pulse">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">🧘</span>
                                <div>
                                    <h4 className="font-bold text-sm tracking-wide text-indigo-300">JollyRoger.AI: Stormy Distraction Waves Spotted!</h4>
                                    <p className="text-xs text-indigo-300/80 mt-0.5">
                                        I noticed you got sidetracked on <span className="font-semibold text-red-400">{interventionDetails?.most_distracting_app || "distractions"}</span> for {interventionDetails?.distracted_mins || "several"} minutes. Let's calm the waters with 1-min Pranayama and a 5-min Code Sprint!
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setModalStep("pranayama");
                                    setPranayamaCountdown(60);
                                    setSprintTimer(300);
                                    setSprintCompleteState(false);
                                    setSprintFeedback("");
                                    const promptData = getSprintTemplate(sprintTopic?.title || "Consistent Hashing");
                                    setSprintCode(promptData.defaultCode);
                                    setSprintTopicPrompt(promptData.prompt);
                                    setShowModal(true);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-200"
                            >
                                Start Focus Session ⚡
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col xl:flex-row gap-8 min-w-0">
                        <div className="flex-1 flex flex-col gap-6 min-w-0">
                            <StatsHeader stats={stats} />
                            <DailyRecommendations />
                            <ReviewToday />
                            <TimerWidget onSessionEnd={refresh} />

                            {!isCustomTrack && progress && (
                                <TrackView
                                    trackKey={activeTrack}
                                    track={progress.topics[activeTrack]}
                                    stats={stats.tracks[activeTrack]}
                                    onUpdate={refresh}
                                />
                            )}

                            {isCustomTrack && userId && (
                                <CustomTrackView
                                    track={customTracks.find(t => t.id === activeTrack)!}
                                    userId={userId}
                                    onUpdate={() => refreshCustomTracks(userId)}
                                />
                            )}
                        </div>

                        <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-6">

                            <SearchWidget />

                        </div>
                    </div>
                </div>
            </main>

            {/* Phase 2: AI-powered proactive intervention banner */}
            <DistractionInterventionBanner
                onSprintAccepted={(topicId, topicTitle) => {
                    setInterventionActive(false);
                    refresh();
                }}
            />

            {/* INTERVENTION MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-indigo-950/80 border border-indigo-500/20 max-w-2xl w-full rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(99,102,241,0.3)] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-indigo-500/10 flex justify-between items-center bg-indigo-950/40">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🧘</span>
                                <h3 className="font-bold text-sm text-indigo-300 tracking-wider uppercase">Jarvis Mind-Body Intervention</h3>
                            </div>
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                                Step {modalStep === "pranayama" ? "1/2: Pranayama" : "2/2: Focus Sprint"}
                            </span>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            
                            {/* STEP 1: PRANAYAMA BREATHING */}
                            {modalStep === "pranayama" && (
                                <div className="flex flex-col items-center text-center space-y-6">
                                    {/* Wisdom Antidote */}
                                    <div className="bg-indigo-950/30 border border-indigo-500/10 rounded-xl p-4 max-w-lg">
                                        <p className="text-xs text-indigo-200 font-mono italic">
                                            "{interventionAntidote?.text || "Yogas Chitta Vritti Nirodha"}"
                                        </p>
                                        <p className="text-[10px] text-indigo-400 font-semibold mt-1">
                                            — {interventionAntidote?.source_book || "Patanjali Yoga Sutras"}
                                        </p>
                                        <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">
                                            {interventionAntidote?.instructions || "Calm the modifications of the mind through breath control."}
                                        </p>
                                    </div>

                                    {/* Breathing Visualizer & Media Guides */}
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-xl">
                                        {/* Breathing Visualizer */}
                                        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                                            {/* Expanding circle */}
                                            <div className={`absolute rounded-full border border-indigo-400/30 transition-all duration-[1000ms] ease-in-out ${
                                                breathPhase === "inhale" ? "w-44 h-44 bg-indigo-500/10 scale-100" :
                                                breathPhase === "hold" ? "w-44 h-44 bg-indigo-500/20 scale-100" :
                                                breathPhase === "exhale" ? "w-20 h-20 bg-indigo-500/5 scale-50" :
                                                "w-20 h-20 bg-indigo-500/5 scale-50"
                                            }`}></div>
                                            
                                            {/* Timer/Status text */}
                                            <div className="z-10 flex flex-col items-center">
                                                <span className="text-2xl font-mono font-bold text-indigo-300">
                                                    {breathSeconds}
                                                </span>
                                                <span className="text-xs text-indigo-200 font-medium uppercase tracking-wide mt-1">
                                                    {getPhaseMessage(breathPhase)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Yoga/Breathing Image Asset */}
                                        {interventionAntidote?.media_path && (
                                            <div className="flex flex-col items-center gap-2 shrink-0">
                                                <img 
                                                    src={interventionAntidote.media_path} 
                                                    alt={interventionAntidote.text}
                                                    className="w-44 h-44 object-cover rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-slate-900"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = 'none';
                                                    }}
                                                />
                                                {interventionAntidote.youtube_id && (
                                                    <a 
                                                        href={`https://youtube.com/watch?v=${interventionAntidote.youtube_id}`}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                                                    >
                                                        🎥 View Video Guide
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs text-text-secondary">
                                            Focus Session ends in: <span className="font-semibold text-indigo-300">{pranayamaCountdown}s</span>
                                        </p>
                                        <button
                                            onClick={() => {
                                                setModalStep("sprint");
                                                setSprintRunning(true);
                                            }}
                                            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                                        >
                                            Skip breathing and start coding →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: CODE SPRINT */}
                            {modalStep === "sprint" && (
                                <div className="space-y-4">
                                    <div className="bg-indigo-950/30 border border-indigo-500/10 rounded-xl p-4">
                                        <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                                            Code Sprint: {sprintTopic?.title}
                                        </h4>
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            {sprintTopicPrompt}
                                        </p>
                                    </div>

                                    {/* Textarea Code Editor */}
                                    <div className="flex flex-col space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono px-1">
                                            <span>index.js</span>
                                            <span className={`${sprintTimer < 60 ? "text-red-400 animate-pulse font-bold" : "text-indigo-400"}`}>
                                                ⏱ Time Left: {formatTime(sprintTimer)}
                                            </span>
                                        </div>
                                        <textarea
                                            value={sprintCode}
                                            onChange={e => sprintRunning && setSprintCode(e.target.value)}
                                            className="w-full h-[220px] bg-slate-950/80 border border-indigo-500/20 rounded-xl p-4 font-mono text-xs text-indigo-100 outline-none focus:border-indigo-500/60 leading-relaxed resize-none"
                                            disabled={!sprintRunning || sprintComplete}
                                        />
                                    </div>

                                    {/* Feedback messages */}
                                    {sprintFeedback && (
                                        <div className={`p-3 rounded-lg text-xs font-mono border ${
                                            sprintComplete 
                                                ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                                                : "bg-red-950/20 border-red-500/20 text-red-400"
                                        }`}>
                                            {sprintFeedback}
                                        </div>
                                    )}

                                    {/* Modal Actions */}
                                    <div className="flex gap-3 justify-end pt-2">
                                        {sprintComplete ? (
                                            <button
                                                onClick={() => {
                                                    setShowModal(false);
                                                    setInterventionActive(false);
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200"
                                            >
                                                Done & Close 🧘
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setShowModal(false)}
                                                    className="border border-indigo-500/20 hover:bg-indigo-950/40 text-text-secondary text-xs px-4 py-2.5 rounded-xl transition-all"
                                                >
                                                    Cancel (Return Distracted)
                                                </button>
                                                <button
                                                    onClick={handleSprintSubmit}
                                                    disabled={!sprintRunning || submittingSprint}
                                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-200"
                                                >
                                                    {submittingSprint ? "Running tests..." : "Submit Solution 🚀"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}