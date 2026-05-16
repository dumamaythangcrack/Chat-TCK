-- ============================================
-- TCK CHAT — Row Level Security Policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- DEVICES / LOGIN HISTORY (owner only)
-- ============================================
CREATE POLICY "Users see own devices"
  ON public.devices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own devices"
  ON public.devices FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own login history"
  ON public.login_history FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- SOCIAL GRAPH
-- ============================================
CREATE POLICY "Anyone can see follows"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users manage own follows"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users delete own follows"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Users manage own friends"
  ON public.friends FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users manage own blocks"
  ON public.blocks FOR ALL USING (auth.uid() = blocker_id);

-- ============================================
-- POSTS
-- ============================================
CREATE POLICY "Public posts are viewable"
  ON public.posts FOR SELECT USING (
    visibility = 'public'
    OR author_id = auth.uid()
    OR (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.friends
      WHERE status = 'accepted'
        AND ((user_id = auth.uid() AND friend_id = posts.author_id)
          OR (friend_id = auth.uid() AND user_id = posts.author_id))
    ))
  );

CREATE POLICY "Users create own posts"
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users update own posts"
  ON public.posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users delete own posts"
  ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- COMMENTS / LIKES
-- ============================================
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Auth users can comment"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users delete own comments"
  ON public.comments FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view likes"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Users manage own likes"
  ON public.likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own shares"
  ON public.shares FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own bookmarks"
  ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STORIES / REELS
-- ============================================
CREATE POLICY "Stories viewable if not expired"
  ON public.stories FOR SELECT USING (expires_at > now());

CREATE POLICY "Users create own stories"
  ON public.stories FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Reels are public"
  ON public.reels FOR SELECT USING (is_draft = false OR author_id = auth.uid());

CREATE POLICY "Users manage own reels"
  ON public.reels FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Users manage own story views"
  ON public.story_views FOR ALL USING (auth.uid() = viewer_id);

-- ============================================
-- MESSAGING (members only)
-- ============================================
CREATE POLICY "Room members can view rooms"
  ON public.rooms FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.room_members WHERE room_id = rooms.id AND user_id = auth.uid())
  );

CREATE POLICY "Auth users create rooms"
  ON public.rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members see room members"
  ON public.room_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid())
  );

CREATE POLICY "Room members can read messages"
  ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.room_members WHERE room_id = messages.room_id AND user_id = auth.uid())
  );

CREATE POLICY "Room members can send messages"
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (SELECT 1 FROM public.room_members WHERE room_id = messages.room_id AND user_id = auth.uid())
  );

CREATE POLICY "Users edit own messages"
  ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users react to messages"
  ON public.message_reactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage read receipts"
  ON public.message_reads FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS (owner only)
-- ============================================
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- WALLET (owner only, highly secured)
-- ============================================
CREATE POLICY "Users see own wallet"
  ON public.wallets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users see own transactions"
  ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users see own withdrawals"
  ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create withdrawal requests"
  ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMMUNITIES
-- ============================================
CREATE POLICY "Public communities viewable"
  ON public.communities FOR SELECT USING (is_public = true);

CREATE POLICY "Community members can view memberships"
  ON public.community_members FOR SELECT USING (true);

-- ============================================
-- LIVESTREAMS
-- ============================================
CREATE POLICY "Active livestreams are public"
  ON public.livestreams FOR SELECT USING (status = 'live' OR streamer_id = auth.uid());

CREATE POLICY "Users manage own streams"
  ON public.livestreams FOR ALL USING (auth.uid() = streamer_id);

CREATE POLICY "Livestream chat is public"
  ON public.livestream_chat FOR SELECT USING (true);

CREATE POLICY "Auth users can chat in streams"
  ON public.livestream_chat FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Livestream gifts are public"
  ON public.livestream_gifts FOR SELECT USING (true);

-- ============================================
-- ADS (owner only)
-- ============================================
CREATE POLICY "Users see own campaigns"
  ON public.ad_campaigns FOR SELECT USING (auth.uid() = advertiser_id);

CREATE POLICY "Users manage own campaigns"
  ON public.ad_campaigns FOR ALL USING (auth.uid() = advertiser_id);

CREATE POLICY "Users see own ads"
  ON public.ads FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ad_campaigns WHERE id = ads.campaign_id AND advertiser_id = auth.uid())
  );

-- ============================================
-- AI (owner only)
-- ============================================
CREATE POLICY "Users see own AI usage"
  ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- REPORTS
-- ============================================
CREATE POLICY "Users create reports"
  ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users see own reports"
  ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
