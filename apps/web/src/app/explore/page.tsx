"use client";

import React from "react";
import { Search, TrendingUp, Hash, Users, Flame, Sparkles } from "lucide-react";

const TRENDING_TAGS = ["#AIVibes", "#CyberPunk", "#TCKChat", "#LiveNow", "#CreatorEconomy", "#Web3", "#GlowUp", "#CodeLife"];

const FEATURED_CREATORS = [
  { name: "Cyber Queen", handle: "cyberqueen", avatar: "https://i.pravatar.cc/150?u=e1", followers: "1.2M" },
  { name: "AI Artist", handle: "ai_artist", avatar: "https://i.pravatar.cc/150?u=e2", followers: "890K" },
  { name: "Tech Guru", handle: "techguru", avatar: "https://i.pravatar.cc/150?u=e3", followers: "650K" },
  { name: "Neon Vibe", handle: "neonvibe", avatar: "https://i.pravatar.cc/150?u=e4", followers: "420K" },
];

export default function ExplorePage() {
  return (
    <div className="max-w-4xl mx-auto w-full py-6 px-4 space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search people, posts, tags, communities..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Trending Tags */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Trending Now
        </h2>
        <div className="flex flex-wrap gap-2">
          {TRENDING_TAGS.map((tag) => (
            <button key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all text-sm font-medium">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" /> Explore Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "For You", icon: Flame, color: "from-red-500 to-orange-500" },
            { name: "Communities", icon: Users, color: "from-blue-500 to-cyan-500" },
            { name: "Trending", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
            { name: "Hashtags", icon: Hash, color: "from-green-500 to-emerald-500" },
          ].map((cat) => (
            <button key={cat.name} className="glass-panel rounded-2xl p-6 hover:scale-105 transition-transform flex flex-col items-center gap-3 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                <cat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-sm">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Creators */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" /> Featured Creators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURED_CREATORS.map((creator) => (
            <div key={creator.handle} className="glass-panel rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
              <img src={creator.avatar} alt={creator.name} className="w-14 h-14 rounded-full border-2 border-primary" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{creator.name}</h3>
                <p className="text-sm text-muted-foreground">@{creator.handle} · {creator.followers}</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity cyber-glow">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
