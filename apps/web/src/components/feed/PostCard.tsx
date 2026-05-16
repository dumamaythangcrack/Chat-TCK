"use client";

import React from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

interface PostProps {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

export function PostCard({ author, content, image, likes, comments }: PostProps) {
  return (
    <div className="glass-panel rounded-3xl p-5 mb-6 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full border-2 border-primary" />
          <div>
            <h3 className="font-bold text-foreground">{author.name}</h3>
            <p className="text-sm text-muted-foreground">@{author.handle}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      <p className="text-foreground/90 mb-4 whitespace-pre-wrap">{content}</p>

      {image && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-white/5">
          <img src={image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      <div className="flex items-center gap-6 text-muted-foreground border-t border-white/5 pt-4">
        <button className="flex items-center gap-2 hover:text-accent transition-colors group">
          <div className="p-2 rounded-full group-hover:bg-accent/20 transition-colors">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-medium">{likes}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors group">
          <div className="p-2 rounded-full group-hover:bg-primary/20 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="font-medium">{comments}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-secondary transition-colors group">
          <div className="p-2 rounded-full group-hover:bg-secondary/20 transition-colors">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}
