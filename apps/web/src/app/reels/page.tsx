import { ReelPlayer } from "@/components/reels/ReelPlayer";

export default function ReelsPage() {
  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      <ReelPlayer 
        src="https://www.w3schools.com/html/mov_bbb.mp4" 
        author="@cybercreator" 
        description="Just another day in the matrix... 🤖✨ #cyber #vibe" 
        likes={4500} 
        comments={320} 
        shares={112} 
      />
      <ReelPlayer 
        src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" 
        author="@ai_artist" 
        description="Testing the new generative models. What do you think? 🎨" 
        likes={8900} 
        comments={1200} 
        shares={450} 
      />
    </div>
  );
}
