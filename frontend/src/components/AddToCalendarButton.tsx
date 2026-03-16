"use client";
import { useState } from "react";
import { smartAddToCalendar } from "@/lib/google-calendar";
import { SRTopic } from "@/lib/spaced-repetition";

export default function AddToCalendarButton({
    topic,
    size = "normal",
}: {
    topic: SRTopic;
    size?: "small" | "normal";
}) {
    const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleClick = async () => {
        setState("loading");
        setErrorMsg("");

        const result = await smartAddToCalendar(topic);

        if (result.method === "api") {
            // Google OAuth — silent API add
            if (result.success) {
                setState("success");
                setTimeout(() => setState("idle"), 3000);
            } else {
                setState("error");
                setErrorMsg(result.error || "Failed to add");
                setTimeout(() => setState("idle"), 4000);
            }
        } else {
            // Email user — URL opened in new tab
            setState("success");
            setTimeout(() => setState("idle"), 3000);
        }
    };

    const isSmall = size === "small";
    const pad = isSmall ? "5px 10px" : "7px 14px";
    const fSize = isSmall ? 10 : 11;

    const styles: Record<string, React.CSSProperties> = {
        idle: {
            padding: pad, borderRadius: 7, fontSize: fSize, fontFamily: "monospace",
            cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
            border: "1px solid rgba(66,133,244,0.35)",
            background: "rgba(66,133,244,0.08)", color: "#4285f4",
        },
        loading: {
            padding: pad, borderRadius: 7, fontSize: fSize, fontFamily: "monospace",
            cursor: "wait", whiteSpace: "nowrap",
            border: "1px solid rgba(66,133,244,0.2)",
            background: "rgba(66,133,244,0.05)", color: "#4285f4", opacity: 0.7,
        },
        success: {
            padding: pad, borderRadius: 7, fontSize: fSize, fontFamily: "monospace",
            cursor: "default", whiteSpace: "nowrap",
            border: "1px solid rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.1)", color: "#10b981",
        },
        error: {
            padding: pad, borderRadius: 7, fontSize: fSize, fontFamily: "monospace",
            cursor: "pointer", whiteSpace: "nowrap",
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.08)", color: "#f87171",
        },
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button
                onClick={handleClick}
                disabled={state === "loading" || state === "success"}
                style={styles[state]}
                title={
                    state === "success"
                        ? "Added to Google Calendar!"
                        : "Add review reminder to your Google Calendar"
                }
            >
                {state === "loading" && "⏳ Adding..."}
                {state === "success" && "✅ Added!"}
                {state === "error" && "⚠ Retry"}
                {state === "idle" && "📅 Add to Calendar"}
            </button>

            {state === "error" && errorMsg && (
                <p style={{ fontSize: 10, fontFamily: "monospace", color: "#f87171", maxWidth: 180, lineHeight: 1.4 }}>
                    {errorMsg}
                </p>
            )}
        </div>
    );
}