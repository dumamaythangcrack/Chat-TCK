"use client";

import React from "react";
import { Image, Video, Mic, Type, Smile, MapPin, X } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Post</h1>
        <button className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity cyber-glow">
          Publish
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
            <span className="font-bold">Username</span>
            <select className="ml-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-muted-foreground">
              <option>🌍 Public</option>
              <option>👥 Friends</option>
              <option>🔒 Private</option>
            </select>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          placeholder="What's on your mind? ✨"
          className="w-full bg-transparent border-none resize-none focus:outline-none text-lg min-h-[200px] placeholder:text-muted-foreground"
          rows={6}
        />

        {/* Media Preview Area */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Add to your post</span>
            <div className="flex gap-1">
              {[
                { icon: Image, color: "hover:text-green-500 hover:bg-green-500/20", label: "Photo" },
                { icon: Video, color: "hover:text-blue-500 hover:bg-blue-500/20", label: "Video" },
                { icon: Mic, color: "hover:text-red-500 hover:bg-red-500/20", label: "Audio" },
                { icon: Smile, color: "hover:text-yellow-500 hover:bg-yellow-500/20", label: "Emoji" },
                { icon: MapPin, color: "hover:text-accent hover:bg-accent/20", label: "Location" },
              ].map((item) => (
                <button key={item.label} className={`p-2.5 rounded-xl text-muted-foreground transition-colors ${item.color}`} title={item.label}>
                  <item.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
