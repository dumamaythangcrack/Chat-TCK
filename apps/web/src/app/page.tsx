import { Feed } from "@/components/feed/Feed";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-purple/10 blur-[120px] rounded-full animate-float pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyber-blue/10 blur-[120px] rounded-full animate-float pointer-events-none" style={{ animationDelay: "1.5s" }}></div>
      
      <Feed />
    </div>
  );
}
