"use client";

import React from "react";
import { Search, Plus, Hash } from "lucide-react";

const MOCK_CHATS = [
  { id: "1", name: "Cyber Knights", avatar: "https://i.pravatar.cc/150?u=a", lastMessage: "Let's push to prod! 🚀", time: "10:23 AM", unread: 3, isGroup: true },
  { id: "2", name: "Alice Synth", avatar: "https://i.pravatar.cc/150?u=b", lastMessage: "Did you see the new AI model?", time: "09:45 AM", unread: 0, isGroup: false },
  { id: "3", name: "Bob Nexus", avatar: "https://i.pravatar.cc/150?u=c", lastMessage: "Check this out man.", time: "Yesterday", unread: 1, isGroup: false },
  { id: "4", name: "Design System", avatar: "https://i.pravatar.cc/150?u=d", lastMessage: "We need more neon shadows.", time: "Yesterday", unread: 0, isGroup: true },
];

export function ChatList() {
  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Messages</h2>
        <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-colors">
          <Plus className="w-5 h-5 text-primary" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search messages..." 
          className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium whitespace-nowrap cyber-glow">All Chats</button>
        <button className="px-4 py-1.5 rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 text-sm font-medium whitespace-nowrap transition-colors">Groups</button>
        <button className="px-4 py-1.5 rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 text-sm font-medium whitespace-nowrap transition-colors">Unread</button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
        {MOCK_CHATS.map(chat => (
          <button key={chat.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group">
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-colors">
                <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
              </div>
              {chat.isGroup && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background flex items-center justify-center border border-white/10">
                  <Hash className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground truncate">{chat.name}</span>
                <span className={`text-xs ${chat.unread > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>{chat.time}</span>
              </div>
              <p className={`text-sm truncate ${chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {chat.lastMessage}
              </p>
            </div>

            {chat.unread > 0 && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white cyber-glow">
                {chat.unread}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
