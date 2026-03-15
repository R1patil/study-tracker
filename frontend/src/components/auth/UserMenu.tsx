"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UserMenu({ user }: { user: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const initials = (user?.user_metadata?.full_name || user?.email || "U")
        .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
    const avatar = user?.user_metadata?.avatar_url;

    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                    border: "1px solid var(--border)", borderRadius: 8, background: "transparent",
                    cursor: "pointer", transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
                {/* Avatar */}
                {avatar ? (
                    <img src={avatar} alt={displayName} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                    <div style={{
                        width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #10b981)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif",
                    }}>
                        {initials}
                    </div>
                )}
                <span style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "DM Sans, sans-serif", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-secondary)", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200,
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "6px", zIndex: 100,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}>
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, fontFamily: "Syne, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {displayName}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user?.email}
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        style={{
                            width: "100%", padding: "8px 12px", textAlign: "left", border: "none",
                            background: "transparent", borderRadius: 6, cursor: "pointer",
                            fontSize: 13, color: "#f87171", fontFamily: "DM Sans, sans-serif",
                            display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                        {loading ? "Signing out..." : "→ Sign Out"}
                    </button>
                </div>
            )}

            {/* Click away */}
            {open && <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />}
        </div>
    );
}