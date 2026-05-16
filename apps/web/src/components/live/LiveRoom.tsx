"use client";

import React, { useState } from "react";
import { Users, Eye, Gift, Heart, Share2, MoreHorizontal, Send, X, Trophy } from "lucide-react";

export function LiveRoom() {
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="flex h-full w-full relative">
      {/* Video Container */}
      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
        <video 
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" 
          autoPlay 
          loop 
          muted 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Stream Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Top HUD */}
      <div className="absolute top-0 w-full p-4 flex items-start justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          {/* Creator Profile Chip */}
          <div className="glass-panel p-1 pr-4 rounded-full flex items-center gap-2 cyber-glow border border-primary/30 bg-black/40 pointer-events-auto cursor-pointer">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=creator" className="w-10 h-10 rounded-full border-2 border-primary" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-black">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-bold leading-tight">Cyber Creator</span>
              <span className="text-white/70 text-xs">24.5K followers</span>
            </div>
            <button className="ml-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold hover:bg-primary/80 transition-colors">
              +
            </button>
          </div>

          {/* Ranking/Stats */}
          <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 bg-black/40 border border-white/10 pointer-events-auto">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-xs font-bold">Top 1</span>
          </div>
        </div>

        {/* Right Stats */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 bg-black/40 border border-white/10">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold">12.4K</span>
          </div>
          <button className="w-8 h-8 rounded-full glass-panel flex items-center justify-center bg-black/40 hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Interactive Chat & Actions Overlay */}
      <div className="absolute bottom-0 w-full flex flex-col justify-end p-4 z-10 pointer-events-none">
        
        {/* Animated Gifts Stream (Mock) */}
        <div className="flex flex-col gap-2 mb-4 max-w-[250px] pointer-events-none">
          <div className="bg-gradient-to-r from-accent/80 to-transparent p-2 rounded-xl flex items-center gap-2 animate-slide-in-right cyber-glow">
            <img src="https://i.pravatar.cc/150?u=fan1" className="w-8 h-8 rounded-full border border-white" />
            <div className="flex flex-col text-white">
              <span className="text-xs font-bold">Alex sent</span>
              <span className="text-sm font-black flex items-center gap-1 text-yellow-300">
                1x Cyber Car 🏎️
              </span>
            </div>
          </div>
        </div>

        {/* Live Chat Log */}
        <div className="h-[250px] w-full md:w-[350px] overflow-y-auto flex flex-col-reverse gap-2 mb-4 pointer-events-auto mask-image-fade-top custom-scrollbar pr-2">
          <div className="bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-xl p-2 px-3 text-sm flex gap-2 w-fit transition-colors">
            <span className="text-primary font-bold">neon_rider:</span>
            <span className="text-white">This looks absolutely stunning! ✨</span>
          </div>
          <div className="bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-xl p-2 px-3 text-sm flex gap-2 w-fit transition-colors">
            <span className="text-secondary font-bold">synthwave99:</span>
            <span className="text-white">Play the next track!</span>
          </div>
          <div className="bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-xl p-2 px-3 text-sm flex gap-2 w-fit transition-colors">
            <span className="text-white/60">System: Welcome to the stream! Keep it friendly.</span>
          </div>
        </div>

        {/* Bottom Bar Actions */}
        <div className="flex items-center justify-between gap-4 pointer-events-auto">
          {/* Chat Input */}
          <div className="flex-1 glass-panel rounded-full bg-black/40 border border-white/10 flex items-center px-4 py-2">
            <input 
              type="text"
              placeholder="Say something..."
              className="bg-transparent border-none focus:outline-none text-white text-sm w-full placeholder:text-white/50"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            {chatInput && (
              <button className="text-primary hover:text-white transition-colors ml-2">
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center bg-black/40 hover:bg-white/10 transition-colors relative overflow-hidden group">
              <Gift className="w-5 h-5 text-accent relative z-10" />
              <div className="absolute inset-0 bg-accent/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
            <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center bg-black/40 hover:bg-white/10 transition-colors">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center bg-primary hover:opacity-90 transition-opacity cyber-glow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
