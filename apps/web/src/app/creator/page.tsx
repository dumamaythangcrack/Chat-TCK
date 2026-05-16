import React from "react";
import { LayoutDashboard, Users, Eye, TrendingUp, DollarSign, Activity, Video, Award } from "lucide-react";

export default function CreatorDashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-cyber-gradient">Creator Studio</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium">
              Last 30 Days
            </button>
            <button className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity font-medium cyber-glow">
              Go Live Now
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Views", value: "2.4M", icon: Eye, color: "text-blue-500", trend: "+12.5%" },
            { label: "New Followers", value: "14.2K", icon: Users, color: "text-green-500", trend: "+5.2%" },
            { label: "Est. Revenue", value: "$4,250", icon: DollarSign, color: "text-yellow-500", trend: "+22.4%" },
            { label: "Engagement Rate", value: "8.4%", icon: Activity, color: "text-accent", trend: "-1.2%" },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts & Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Placeholder */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Growth Overview
              </h3>
            </div>
            <div className="h-64 w-full flex items-end justify-between gap-2 border-b border-white/10 pb-4 relative">
              {/* Fake Chart Bars */}
              {[40, 70, 45, 90, 65, 85, 100, 75, 50, 80, 95, 60].map((height, i) => (
                <div key={i} className="w-full bg-primary/20 hover:bg-primary/50 transition-colors rounded-t-sm relative group cursor-pointer" style={{ height: `${height}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {height}k views
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Top Content
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { title: "My AI Setup Tour", type: "Reel", views: "450K", rev: "$120" },
                { title: "React 19 Changes", type: "Video", views: "320K", rev: "$450" },
                { title: "Chill Coding Stream", type: "Live", views: "89K", rev: "$890" },
                { title: "Design System Tips", type: "Post", views: "45K", rev: "$12" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-sm truncate">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.type} • {item.views} views</span>
                  </div>
                  <span className="font-bold text-green-500">{item.rev}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
              View Analytics
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
