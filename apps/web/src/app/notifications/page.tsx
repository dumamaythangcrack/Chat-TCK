"use client";

import React from "react";
import { Bell, Heart, MessageCircle, Users, Video, Gift, AtSign, CheckCheck } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "like", actor: "Cyber Queen", avatar: "https://i.pravatar.cc/150?u=n1", body: "liked your post", time: "2m ago", read: false },
  { id: "2", type: "comment", actor: "Tech Guru", avatar: "https://i.pravatar.cc/150?u=n2", body: 'commented: "This is amazing! 🔥"', time: "15m ago", read: false },
  { id: "3", type: "follow", actor: "Neon Girl", avatar: "https://i.pravatar.cc/150?u=n3", body: "started following you", time: "1h ago", read: false },
  { id: "4", type: "mention", actor: "AI Artist", avatar: "https://i.pravatar.cc/150?u=n4", body: "mentioned you in a comment", time: "3h ago", read: true },
  { id: "5", type: "live", actor: "Stream King", avatar: "https://i.pravatar.cc/150?u=n5", body: "just went live: Chill Coding Session", time: "5h ago", read: true },
  { id: "6", type: "gift", actor: "Anonymous", avatar: "https://i.pravatar.cc/150?u=n6", body: "sent you a 🌹 Rose worth 50 coins", time: "1d ago", read: true },
];

const iconMap: Record<string, React.ElementType> = {
  like: Heart, comment: MessageCircle, follow: Users, mention: AtSign, live: Video, gift: Gift,
};

const colorMap: Record<string, string> = {
  like: "text-red-500 bg-red-500/20", comment: "text-blue-500 bg-blue-500/20", follow: "text-primary bg-primary/20",
  mention: "text-yellow-500 bg-yellow-500/20", live: "text-green-500 bg-green-500/20", gift: "text-accent bg-accent/20",
};

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" /> Notifications
        </h1>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {MOCK_NOTIFICATIONS.map((notif) => {
          const Icon = iconMap[notif.type] ?? Bell;
          const color = colorMap[notif.type] ?? "text-muted-foreground bg-white/10";
          return (
            <div key={notif.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors cursor-pointer ${notif.read ? 'hover:bg-white/5' : 'bg-white/5 hover:bg-white/10'}`}>
              <div className="relative">
                <img src={notif.avatar} alt={notif.actor} className="w-12 h-12 rounded-full" />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${color}`}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-bold">{notif.actor}</span>{" "}
                  <span className="text-muted-foreground">{notif.body}</span>
                </p>
                <span className="text-xs text-muted-foreground">{notif.time}</span>
              </div>
              {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 cyber-glow" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
