import { Hash, Search } from "lucide-react";

export default function CommunitiesPage() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <span>general</span>
        </div>
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-black/40 border border-white/5 rounded-md py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-primary/50 transition-colors w-64"
          />
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
        {/* Welcome Message */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <Hash className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to #general!</h1>
          <p className="text-muted-foreground">This is the start of the #general channel.</p>
        </div>

        <div className="flex gap-4 mt-8 hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
          <img src="https://i.pravatar.cc/150?u=a" className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-primary hover:underline cursor-pointer">Admin</span>
              <span className="text-xs text-muted-foreground">Today at 10:00 AM</span>
            </div>
            <p className="text-foreground/90 text-sm">Welcome everyone to the new TCK Communities platform! Let me know if you find any bugs.</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 shrink-0">
        <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4 py-3">
          <input 
            type="text" 
            placeholder="Message #general" 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}
