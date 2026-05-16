import { LiveRoom } from "@/components/live/LiveRoom";

export default function LivePage() {
  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen w-full bg-black overflow-hidden relative">
      <LiveRoom />
    </div>
  );
}
