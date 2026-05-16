"use client";

import React from "react";
import Link from "next/link";
import { Home, Compass, PlusSquare, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";

const mobileNav = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Create", href: "/create", icon: PlusSquare },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/5 z-50 flex items-center justify-around px-2 pb-safe">
      {mobileNav.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.name === "Create") {
          return (
            <Link key={item.name} href={item.href} className="flex items-center justify-center w-12 h-10 rounded-xl bg-cyber-gradient cyber-glow shadow-primary text-black">
              <item.icon className="w-6 h-6" />
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-12 h-full transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        );
      })}
    </nav>
  );
}
