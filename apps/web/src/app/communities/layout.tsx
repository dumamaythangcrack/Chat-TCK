"use client";

import React from "react";
import { ServerList } from "@/components/communities/ServerList";
import { ChannelList } from "@/components/communities/ChannelList";

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      <ServerList />
      <ChannelList />
      <div className="flex-1 bg-background flex flex-col relative min-w-0">
        {children}
      </div>
    </div>
  );
}
