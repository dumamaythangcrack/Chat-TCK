"use client";

import React from "react";
import Link from "next/link";
import { Home, Compass, PlaySquare, Video, MessageCircle, Users, Bell, Wallet, Bot, User, Settings, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Reels", href: "/reels", icon: PlaySquare },
  { name: "Live", href: "/live", icon: Video },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Communities", href: "/communities", icon: Users },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "AI Assistant", href: "/ai", icon: Bot },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Creator", href: "/creator", icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-64 glass-panel border-r border-white/5 transition-all duration-300 relative z-10 flex-shrink-0">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6">
        <div className="w-8 h-8 rounded-full bg-cyber-gradient cyber-glow shadow-primary"></div>
        <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight text-transparent bg-clip-text bg-cyber-gradient">
          TCK Chat
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? "bg-primary/20 text-primary cyber-glow" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <item.icon className={`w-6 h-6 shrink-0 ${isActive ? "text-primary" : "group-hover:text-foreground"}`} />
              <span className="hidden lg:block font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="avatar" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Username</span>
            <span className="text-xs text-muted-foreground">@handle</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
