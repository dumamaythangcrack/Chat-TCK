"use client";

import React from "react";
import { Plus, Compass } from "lucide-react";

const MOCK_SERVERS = [
  { id: "1", name: "TCK Official", icon: "https://i.pravatar.cc/150?u=tck", notifications: 0 },
  { id: "2", name: "NextJS Devs", icon: "https://i.pravatar.cc/150?u=next", notifications: 5 },
  { id: "3", name: "Design UI", icon: "https://i.pravatar.cc/150?u=ui", notifications: 0 },
];

export function ServerList() {
  return (
    <div className="w-[72px] bg-black/40 border-r border-white/5 flex flex-col items-center py-3 gap-2 flex-shrink-0 z-20">
      {/* Home / DMs */}
      <button className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-primary/20 hover:bg-primary transition-all duration-300 flex items-center justify-center group cyber-glow relative">
        <div className="w-full h-full rounded-[inherit] overflow-hidden flex items-center justify-center">
          <span className="font-black text-primary group-hover:text-white transition-colors">TCK</span>
        </div>
      </button>

      <div className="w-8 h-[2px] bg-white/10 rounded-full my-1" />

      {MOCK_SERVERS.map(server => (
        <div key={server.id} className="relative group flex items-center justify-center">
          <div className={`absolute -left-3 w-2 bg-white rounded-r-full transition-all duration-300 ${server.notifications > 0 ? "h-2" : "h-0 group-hover:h-5"}`} />
          <button className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-white/5 transition-all duration-300 flex items-center justify-center overflow-hidden">
            <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
          </button>
          {server.notifications > 0 && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-destructive border-4 border-black rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {server.notifications}
            </div>
          )}
        </div>
      ))}

      <button className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-white/5 hover:bg-green-500/20 text-green-500 transition-all duration-300 flex items-center justify-center group mt-2">
        <Plus className="w-6 h-6" />
      </button>

      <button className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-white/5 hover:bg-white/20 text-muted-foreground hover:text-white transition-all duration-300 flex items-center justify-center group">
        <Compass className="w-6 h-6" />
      </button>
    </div>
  );
}
