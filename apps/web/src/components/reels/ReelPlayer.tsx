"use client";

import React, { useRef, useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Music } from "lucide-react";

interface ReelPlayerProps {
  src: string;
  author: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

export function ReelPlayer({ src, author, description, likes, comments, shares }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Intersection observer to autoplay when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full w-full max-w-md mx-auto relative snap-start bg-black flex items-center justify-center group overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        className="h-full w-full object-cover"
        onClick={togglePlay}
      />

      {/* Floating Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mb-2 shadow-lg cyber-glow cursor-pointer">
          <img src="https://i.pravatar.cc/150?u=reels" alt="creator" className="w-full h-full object-cover" />
        </div>

        <button 
          onClick={() => setIsLiked(!isLiked)} 
          className="flex flex-col items-center gap-1 group/btn"
        >
          <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-hover/btn:bg-black/40 transition-colors">
            <Heart className={`w-7 h-7 ${isLiked ? 'fill-accent text-accent' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{likes + (isLiked ? 1 : 0)}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-hover/btn:bg-black/40 transition-colors">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{comments}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-hover/btn:bg-black/40 transition-colors">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{shares}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-hover/btn:bg-black/40 transition-colors">
            <MoreVertical className="w-7 h-7 text-white" />
          </div>
        </button>

        {/* Spinning Record */}
        <div className="w-10 h-10 rounded-full bg-neutral-800 border-4 border-neutral-900 mt-4 flex items-center justify-center animate-spin" style={{ animationDuration: "3s" }}>
          <Music className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-20 left-4 right-20 z-10 pointer-events-none">
        <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">{author}</h3>
        <p className="text-white/90 text-sm mb-3 drop-shadow-md line-clamp-2">{description}</p>
        
        <div className="flex items-center gap-2 text-white/80 bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
          <Music className="w-4 h-4" />
          <span className="text-sm overflow-hidden whitespace-nowrap text-ellipsis max-w-[150px]">
            Original Sound - {author}
          </span>
        </div>
      </div>
    </div>
  );
}
