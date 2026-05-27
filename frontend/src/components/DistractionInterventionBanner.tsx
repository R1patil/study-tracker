"use client";

import { useState, useEffect, useCallback } from "react";
import { getAccessToken } from "../lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface InterventionData {
  trigger: boolean;
  message?: string;
  sprint_topic?: { id: string; title: string };
  distraction_details?: { distracted_mins: number; most_distracting_app: string };
}

interface Props {
  onSprintAccepted?: (topicId: string, topicTitle: string) => void;
}

export default function DistractionInterventionBanner({ onSprintAccepted }: Props) {
  const [intervention, setIntervention] = useState<InterventionData | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [completing, setCompleting] = useState(false);

  const checkForIntervention = useCallback(async () => {
    if (dismissed) return;
    try {
      const token = await getAccessToken();
      if (!token) return;
      const resp = await fetch(`${API_URL}/agent/proactive-check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data: InterventionData = await resp.json();
        if (data.trigger) {
          setIntervention(data);
          setVisible(true);
          setDismissed(false);
        } else {
          setVisible(false);
        }
      }
    } catch (e) {
      // Backend not reachable, silently ignore
    }
  }, [dismissed]);

  useEffect(() => {
    // Poll every 60 seconds
    checkForIntervention();
    const interval = setInterval(checkForIntervention, 60_000);
    return () => clearInterval(interval);
  }, [checkForIntervention]);

  const handleAcceptSprint = async () => {
    if (!intervention?.sprint_topic) return;
    setCompleting(true);
    try {
      const token = await getAccessToken();
      await fetch(`${API_URL}/activity/sprint-complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic_id: intervention.sprint_topic.id,
          topic_title: intervention.sprint_topic.title,
        }),
      });
      onSprintAccepted?.(intervention.sprint_topic.id, intervention.sprint_topic.title);
    } catch (e) {
      // Silently proceed
    } finally {
      setCompleting(false);
      setVisible(false);
      setDismissed(true);
      // Re-enable checks after 15 minutes
      setTimeout(() => setDismissed(false), 15 * 60 * 1000);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    setTimeout(() => setDismissed(false), 10 * 60 * 1000);
  };

  if (!visible || !intervention) return null;

  const { message, sprint_topic, distraction_details } = intervention;
  const app = distraction_details?.most_distracting_app || "a distraction";
  const mins = distraction_details?.distracted_mins ?? 5;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[380px] rounded-2xl border border-amber-500/40 shadow-2xl shadow-amber-900/30 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(20, 14, 0, 0.97) 0%, rgba(30, 18, 0, 0.97) 100%)",
        backdropFilter: "blur(20px)",
        animation: "slideUpBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/10">
        <span className="text-lg">⚡</span>
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
          Jarvis Intervention
        </span>
        <div className="flex-1" />
        <span className="text-xs text-amber-500/60">{mins} min on {app}</span>
      </div>

      {/* Message */}
      <div className="px-4 py-3">
        <p className="text-sm text-amber-100/90 leading-relaxed">{message}</p>
      </div>

      {/* Sprint suggestion */}
      {sprint_topic && (
        <div className="mx-4 mb-3 p-3 rounded-xl bg-indigo-900/30 border border-indigo-500/20">
          <p className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1">Suggested 5-min Sprint</p>
          <p className="text-sm font-semibold text-indigo-200">🎯 {sprint_topic.title}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={handleAcceptSprint}
          disabled={completing}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
          style={{
            background: completing
              ? "rgba(99,102,241,0.4)"
              : "linear-gradient(135deg, #6366f1, #4f46e5)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
          }}
        >
          {completing ? "Logging Sprint... ✓" : "✅ Accept Sprint"}
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2.5 rounded-xl text-sm text-amber-500/70 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200"
        >
          Later
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUpBanner {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
