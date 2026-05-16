"use client";

import React from "react";
import { PostCard } from "./PostCard";

const MOCK_POSTS = [
  {
    id: "1",
    author: {
      name: "Cyber Punk",
      handle: "cyberpunk",
      avatar: "https://i.pravatar.cc/150?u=1",
    },
    content: "Just deployed my new AI agent to production! The glassmorphism UI is looking absolutely insane. 🚀✨ #tech #ai",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    likes: 1240,
    comments: 89,
  },
  {
    id: "2",
    author: {
      name: "Neon Girl",
      handle: "neongirl",
      avatar: "https://i.pravatar.cc/150?u=2",
    },
    content: "Vibing in the metaverse today. The new update for TCK Chat is incredibly smooth.",
    likes: 856,
    comments: 42,
  },
  {
    id: "3",
    author: {
      name: "Tech Guru",
      handle: "techguru",
      avatar: "https://i.pravatar.cc/150?u=3",
    },
    content: "Who else is loving the new dark mode aesthetics? It's so clean.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
    likes: 3400,
    comments: 210,
  }
];

export function Feed() {
  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Feed</h2>
        {/* Create Post Input Trigger */}
        <div className="glass-panel p-4 rounded-3xl flex items-center gap-4 cursor-text">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="me" className="w-10 h-10 rounded-full" />
          <div className="flex-1 bg-white/5 rounded-full px-4 py-3 text-muted-foreground border border-white/5">
            What's on your mind?
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {MOCK_POSTS.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
