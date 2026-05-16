"use client";

import React from "react";
import { User, Settings, Bookmark, Grid3X3, Heart, Shield, Award, Edit3 } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Info */}
      <div className="px-4 md:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <img
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-background"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-black">Username</h1>
            <p className="text-muted-foreground">@handle · Level 12</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity cyber-glow flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-4 text-foreground/80 max-w-lg">✨ Building the future of social. Creator & Developer. Premium member since 2024.</p>

        {/* Stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <span><strong className="text-foreground">1,234</strong> <span className="text-muted-foreground">Posts</span></span>
          <span><strong className="text-foreground">45.2K</strong> <span className="text-muted-foreground">Followers</span></span>
          <span><strong className="text-foreground">892</strong> <span className="text-muted-foreground">Following</span></span>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mt-4">
          {[
            { label: "Premium", icon: Shield, color: "bg-yellow-500/20 text-yellow-500" },
            { label: "Verified", icon: Award, color: "bg-blue-500/20 text-blue-500" },
            { label: "Creator", icon: User, color: "bg-accent/20 text-accent" },
          ].map((badge) => (
            <span key={badge.label} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${badge.color}`}>
              <badge.icon className="w-3 h-3" /> {badge.label}
            </span>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mt-8 border-b border-white/5">
          {[
            { label: "Posts", icon: Grid3X3 },
            { label: "Liked", icon: Heart },
            { label: "Saved", icon: Bookmark },
          ].map((tab, i) => (
            <button
              key={tab.label}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Grid Placeholder */}
        <div className="grid grid-cols-3 gap-1 mt-4 pb-20">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-lg hover:opacity-80 transition-opacity cursor-pointer" />
          ))}
        </div>
      </div>
    </div>
  );
}
