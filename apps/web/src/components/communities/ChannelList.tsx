"use client";

import React from "react";
import { Hash, Volume2, ChevronDown } from "lucide-react";

export function ChannelList() {
  return (
    <div className="w-60 bg-card/40 backdrop-blur-xl border-r border-white/5 flex flex-col flex-shrink-0 z-10 hidden md:flex">
      {/* Server Header */}
      <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer shrink-0">
        <h2 className="font-bold text-[15px] truncate text-foreground">TCK Official</h2>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-4 custom-scrollbar">
        
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1 hover:text-white transition-colors cursor-pointer">
            <ChevronDown className="w-3 h-3" />
            Information
          </div>
          <div className="flex flex-col gap-[2px]">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors text-sm w-full text-left">
              <Hash className="w-5 h-5 shrink-0" />
              <span className="truncate">announcements</span>
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors text-sm w-full text-left">
              <Hash className="w-5 h-5 shrink-0" />
              <span className="truncate">rules</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1 hover:text-white transition-colors cursor-pointer">
            <ChevronDown className="w-3 h-3" />
            Text Channels
          </div>
          <div className="flex flex-col gap-[2px]">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/10 text-foreground transition-colors text-sm w-full text-left">
              <Hash className="w-5 h-5 shrink-0" />
              <span className="truncate font-medium">general</span>
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors text-sm w-full text-left">
              <Hash className="w-5 h-5 shrink-0" />
              <span className="truncate">memes</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1 hover:text-white transition-colors cursor-pointer">
            <ChevronDown className="w-3 h-3" />
            Voice Channels
          </div>
          <div className="flex flex-col gap-[2px]">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors text-sm w-full text-left">
              <Volume2 className="w-5 h-5 shrink-0" />
              <span className="truncate">Lounge</span>
            </button>
          </div>
        </div>

      </div>

      {/* User Area */}
      <div className="h-[52px] bg-black/40 flex items-center px-2 shrink-0">
        <div className="flex items-center gap-2 hover:bg-white/10 rounded-md p-1 px-2 cursor-pointer transition-colors w-full">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="w-8 h-8 rounded-full" />
          <div className="flex flex-col truncate flex-1 min-w-0">
            <span className="text-sm font-bold text-foreground truncate">Username</span>
            <span className="text-xs text-muted-foreground truncate">#1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
