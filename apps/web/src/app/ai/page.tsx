"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles, Wand2, Languages, MessageSquare } from "lucide-react";

export default function AiPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm your TCK AI Assistant powered by Gemini. I can help you with:\n\n✨ Smart replies\n🌐 Translation\n📝 Content creation\n🔍 Smart search\n📊 Analytics insights\n\nWhat can I help you with?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm currently in demo mode! Once connected to the Gemini API backend (/api/ai), I'll be able to assist you with real AI capabilities. 🤖✨" },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-cyber-gradient flex items-center justify-center cyber-glow">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold">TCK AI Assistant</h1>
          <p className="text-xs text-muted-foreground">Powered by Gemini • Online</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide">
        {[
          { label: "Smart Reply", icon: MessageSquare },
          { label: "Translate", icon: Languages },
          { label: "Create Post", icon: Wand2 },
          { label: "Summarize", icon: Sparkles },
        ].map((action) => (
          <button key={action.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all whitespace-nowrap text-sm">
            <action.icon className="w-4 h-4" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary text-white rounded-br-md"
                : "glass-panel rounded-bl-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI anything..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors text-sm"
          />
          <button
            onClick={handleSend}
            className="px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity cyber-glow"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
