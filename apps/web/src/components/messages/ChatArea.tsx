"use client";

import React from "react";
import { Phone, Video, Info, Paperclip, Mic, Smile, Send } from "lucide-react";

export function ChatArea() {
  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Chat Header */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl absolute top-0 w-full z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden relative">
            <img src="https://i.pravatar.cc/150?u=a" alt="Cyber Knights" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Cyber Knights</h3>
            <p className="text-xs text-primary font-medium">3 typing...</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary">
            <Phone className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-secondary">
            <Video className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-28 pb-24 flex flex-col gap-6 custom-scrollbar">
        {/* Mock Messages */}
        <div className="flex flex-col gap-2 max-w-[80%] self-start">
          <div className="flex items-end gap-2">
            <img src="https://i.pravatar.cc/150?u=1" className="w-8 h-8 rounded-full mb-1" />
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
              Hey everyone! The new design system is live.
            </div>
          </div>
          <span className="text-xs text-muted-foreground ml-10">10:15 AM</span>
        </div>

        <div className="flex flex-col gap-2 max-w-[80%] self-end">
          <div className="flex items-end gap-2 flex-row-reverse">
            <div className="bg-primary/20 border border-primary/30 text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 text-sm cyber-glow">
              Looks amazing! Let's push to prod! 🚀
            </div>
          </div>
          <span className="text-xs text-muted-foreground mr-2 self-end">10:23 AM</span>
        </div>

        {/* Typing indicator */}
        <div className="flex items-end gap-2 mt-4">
           <img src="https://i.pravatar.cc/150?u=2" className="w-8 h-8 rounded-full mb-1" />
           <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-4 flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }}></div>
             <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }}></div>
             <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }}></div>
           </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full p-4 bg-background/80 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-2 glass-panel rounded-full p-2 px-4">
          <button className="text-muted-foreground hover:text-primary transition-colors p-2">
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            placeholder="Message Cyber Knights..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground py-2"
          />
          <button className="text-muted-foreground hover:text-accent transition-colors p-2">
            <Smile className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-secondary transition-colors p-2">
            <Mic className="w-5 h-5" />
          </button>
          <button className="bg-primary text-white p-3 rounded-full hover:opacity-90 transition-opacity ml-2 shadow-lg cyber-glow">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
