"use client";

import { useEffect, useState } from "react";
import { getActivitySummary } from "../lib/api";

interface AppMetric {
  name: string;
  mins: number;
}

interface ActivitySummary {
  focus_score: number;
  productive_mins: number;
  distracted_mins: number;
  top_apps: AppMetric[];
  top_distractions: AppMetric[];
}

export default function FocusMetricsWidget() {
  const [data, setData] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivitySummary()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load activity logs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl glass p-5 h-[200px] flex items-center justify-center flex-col gap-2">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        <span className="text-xs text-text-secondary">Loading focus metrics...</span>
      </div>
    );
  }

  const summary = data || {
    focus_score: 100,
    productive_mins: 0,
    distracted_mins: 0,
    top_apps: [],
    top_distractions: [],
  };

  const totalMins = summary.productive_mins + summary.distracted_mins;
  const prodPercent = totalMins > 0 ? (summary.productive_mins / totalMins) * 100 : 100;

  return (
    <div className="rounded-2xl glass p-5 relative overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wide">
            Focus & Productivity
          </h3>
        </div>
        <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
          WSL Daemon Active
        </span>
      </div>

      {/* Main Focus score */}
      <div className="flex items-center gap-6 mb-5">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Circular progress SVG */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-muted/30"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`${
                summary.focus_score > 70
                  ? "text-emerald-500"
                  : summary.focus_score > 40
                  ? "text-amber-500"
                  : "text-red-500"
              } transition-all duration-500`}
              strokeDasharray={`${summary.focus_score}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-bold tracking-tight text-text-primary">
              {summary.focus_score}%
            </span>
            <span className="text-[8px] text-text-secondary uppercase font-semibold">
              Focus Score
            </span>
          </div>
        </div>

        {/* Time stats */}
        <div className="flex-1 space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">Productive Time</span>
              <span className="text-emerald-400 font-semibold">{summary.productive_mins} mins</span>
            </div>
            <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${prodPercent}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">Distracted Time</span>
              <span className="text-red-400 font-semibold">{summary.distracted_mins} mins</span>
            </div>
            <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full" 
                style={{ width: `${100 - prodPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Productive Apps vs Distractions */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30 text-xs">
        <div>
          <h4 className="font-semibold text-indigo-300 uppercase text-[9px] mb-2 tracking-wider">
            🚀 TOP PRODUCTIVE
          </h4>
          {summary.top_apps.length === 0 ? (
            <p className="text-text-secondary text-[10px] italic">No active logs yet</p>
          ) : (
            <ul className="space-y-1.5">
              {summary.top_apps.map((app, idx) => (
                <li key={idx} className="flex justify-between items-center text-[10px]">
                  <span className="text-text-secondary truncate max-w-[100px]" title={app.name}>
                    {app.name}
                  </span>
                  <span className="text-emerald-400 font-mono font-medium">{app.mins}m</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-red-400 uppercase text-[9px] mb-2 tracking-wider">
            ⚠️ DISTRACTIONS
          </h4>
          {summary.top_distractions.length === 0 ? (
            <p className="text-text-secondary text-[10px] italic">No active logs yet</p>
          ) : (
            <ul className="space-y-1.5">
              {summary.top_distractions.map((app, idx) => (
                <li key={idx} className="flex justify-between items-center text-[10px]">
                  <span className="text-text-secondary truncate max-w-[100px]" title={app.name}>
                    {app.name}
                  </span>
                  <span className="text-red-400 font-mono font-medium">{app.mins}m</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
