import React from "react";
import { ChatList } from "@/components/messages/ChatList";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-background relative overflow-hidden">
      {/* Sidebar - Hidden on mobile if viewing a chat, but we'll manage that state. For now, flex split on desktop */}
      <div className="w-full md:w-80 lg:w-96 border-r border-white/5 h-full flex-shrink-0 flex flex-col bg-card/50 backdrop-blur-xl">
        <ChatList />
      </div>
      
      {/* Main Chat Area */}
      <div className="hidden md:flex flex-1 h-full bg-background relative">
        {children}
      </div>
    </div>
  );
}
