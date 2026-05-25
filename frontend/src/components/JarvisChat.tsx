"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithJarvis } from "../lib/api";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function JarvisChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am **Jarvis**, your Student OS coach and mentor. I have connected to your study trackers, calendar, active window logs, and search history via Coral.\n\nAsk me how your focus is today, request study recommendations, or let's draft an interview prep roadmap!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    if (!textToSend) setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Map frontend messages role assistant -> assistant, user -> user
      const chatHistory = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await chatWithJarvis(text, chatHistory);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **System Error:** Failed to establish connection with Jarvis. Please make sure the backend server and Coral are running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "📊 Analyze Focus", query: "Can you analyze my screen logs today? Have I been focused or distracted?" },
    { label: "🎯 Weak Topics", query: "Which topics in my curriculum do you recommend I focus on next, based on my status?" },
    { label: "⚡ Sprint Plan", query: "Give me a 30-minute structured study plan for my consistent hashing topic based on my logs." },
  ];

  return (
    <div className="flex flex-col h-[550px] rounded-2xl glass-premium overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-indigo-500/20 bg-indigo-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white jarvis-avatar-pulse border border-indigo-400">
            🤖
          </div>
          <div>
            <h3 className="font-semibold text-sm text-indigo-200 tracking-wide">JARVIS AI MENTOR</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-text-secondary uppercase">Connected to Coral SQL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} fade-up`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-surface2/60 text-indigo-50 border border-indigo-950/50 rounded-bl-none"
              }`}
            >
              {/* Very basic markdown bold parsing for clean formatting */}
              {msg.content.split("\n").map((line, lIdx) => {
                const parts = line.split("**");
                return (
                  <p key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>
                    {parts.map((part, pIdx) =>
                      pIdx % 2 === 1 ? <strong key={pIdx} className="text-indigo-300 font-bold">{part}</strong> : part
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface2/60 text-indigo-100 rounded-2xl rounded-bl-none px-4 py-3 border border-indigo-950/50 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-border/30 bg-surface/30">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              className="text-xs bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full transition-all duration-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/30 bg-surface/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Jarvis (e.g. How is my focus today?)"
          className="flex-1 bg-surface2 border border-border/60 hover:border-indigo-500/30 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-all duration-200"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center font-medium"
        >
          🚀
        </button>
      </div>
    </div>
  );
}
