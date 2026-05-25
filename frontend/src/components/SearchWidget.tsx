"use client";

import { useState } from "react";
import { logGoogleSearch } from "../lib/api";

export default function SearchWidget() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("System Design");
  const [showRecommendation, setShowRecommendation] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      // 1. Log search to Coral SQL data layer
      await logGoogleSearch(query, category);
      
      // 2. Open Google in a new window for the user's productivity
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
      
      // 3. Show mid-flow recommendations trigger
      setShowRecommendation(true);
    } catch (err) {
      console.error("Failed to log search query:", err);
    }
  };

  const categories = ["System Design", "Machine Learning", "MLOps"];

  return (
    <div className="rounded-2xl glass p-5 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔍</span>
        <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wide">
          Google Study Assistant
        </h3>
      </div>

      <p className="text-xs text-text-secondary mb-4 leading-relaxed">
        Search for coding problems, concepts, or interview questions. Jarvis logs and analyzes these queries to tailor your study plan.
      </p>

      <form onSubmit={handleSearch} className="space-y-3">
        {/* Category selector */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`text-[10px] px-2.5 py-1 rounded-md transition-all duration-200 ${
                category === cat
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                  : "bg-surface2 text-text-secondary border border-border/40 hover:text-text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. consistent hashing rings..."
            className="flex-1 bg-surface2 border border-border hover:border-indigo-500/20 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-text-primary outline-none transition-all duration-200"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl transition-all duration-200"
          >
            Search
          </button>
        </div>
      </form>

      {/* Mid-flow recommendation card */}
      {showRecommendation && (
        <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl fade-up">
          <div className="flex items-start gap-2">
            <span className="text-xs mt-0.5">💡</span>
            <div>
              <h4 className="text-xs font-semibold text-indigo-200">Jarvis Mid-Flow recommendation:</h4>
              <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                I logged your search for <span className="text-indigo-300 font-semibold">"{query}"</span>. Ask me to pull matching curriculum tracks or outline a study checklist to guide you!
              </p>
              <button 
                onClick={() => setShowRecommendation(false)}
                className="text-[10px] text-text-secondary hover:text-indigo-300 mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
