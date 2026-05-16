"use client";

import React from "react";
import { Settings, User, Bell, Shield, Palette, Moon, Globe, Volume2, Lock, Smartphone, HelpCircle, LogOut } from "lucide-react";

const SETTING_GROUPS = [
  {
    title: "Account",
    items: [
      { label: "Edit Profile", icon: User, desc: "Name, bio, avatar" },
      { label: "Privacy & Security", icon: Shield, desc: "Password, 2FA, blocked users" },
      { label: "Devices", icon: Smartphone, desc: "Manage trusted devices" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { label: "Notifications", icon: Bell, desc: "Push, email, in-app" },
      { label: "Appearance", icon: Palette, desc: "Theme, colors, fonts" },
      { label: "Dark Mode", icon: Moon, desc: "System, light, dark, AMOLED" },
      { label: "Language", icon: Globe, desc: "Display language" },
      { label: "Sound & Haptics", icon: Volume2, desc: "Message sounds, vibration" },
    ],
  },
  {
    title: "Privacy",
    items: [
      { label: "Data & Storage", icon: Lock, desc: "Cache, download settings" },
      { label: "Help & Support", icon: HelpCircle, desc: "FAQ, contact us" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4 space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" /> Settings
      </h1>

      {SETTING_GROUPS.map((group) => (
        <div key={group.title}>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">{group.title}</h2>
          <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-white/5">
            {group.items.map((item) => (
              <button key={item.label} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium block">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button className="w-full flex items-center gap-4 p-4 rounded-2xl glass-panel hover:bg-red-500/10 transition-colors text-red-500">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Log Out</span>
      </button>
    </div>
  );
}
