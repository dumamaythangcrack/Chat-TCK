-- ============================================
-- TCK CHAT — Complete Database Schema
-- PostgreSQL / Supabase
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- AUTH / PROFILES
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3),
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT DEFAULT '' CHECK (char_length(bio) <= 500),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_tier TEXT DEFAULT 'free' CHECK (premium_tier IN ('free','plus','ultra','creator','business')),
  verified BOOLEAN DEFAULT FALSE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  is_online BOOLEAN DEFAULT FALSE,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  device_name TEXT,
  platform TEXT,
  is_trusted BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  device_id UUID REFERENCES public.devices(id),
  provider TEXT DEFAULT 'email',
  success BOOLEAN DEFAULT TRUE,
  suspicious BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SOCIAL GRAPH
-- ============================================

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- ============================================
-- POSTS / FEED
-- ============================================

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  media_urls TEXT[] DEFAULT '{}',
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text','image','video','poll','carousel','audio','mood','anonymous','collaborative')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public','friends','private')),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  ai_score FLOAT DEFAULT 0,
  hashtags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE public.hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STORIES / REELS
-- ============================================

CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image','video')),
  caption TEXT,
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

CREATE TABLE public.reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT DEFAULT '',
  sound_name TEXT,
  duration_sec INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  ai_score FLOAT DEFAULT 0,
  hashtags TEXT[] DEFAULT '{}',
  is_draft BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MESSAGING
-- ============================================

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type TEXT DEFAULT 'dm' CHECK (room_type IN ('dm','group','community','ai','secret')),
  name TEXT,
  avatar_url TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','moderator','member')),
  is_muted BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  folder TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','video','audio','file','gif','sticker','poll','system')),
  media_url TEXT,
  reply_to_id UUID REFERENCES public.messages(id),
  thread_id UUID REFERENCES public.messages(id),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  disappear_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE public.message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_message_id UUID REFERENCES public.messages(id),
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  is_multiple BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id, option_index)
);

CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES public.profiles(id),
  call_type TEXT DEFAULT 'voice' CHECK (call_type IN ('voice','video','group_voice','group_video')),
  status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing','active','ended','missed','declined')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_sec INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- COMMUNITIES (Discord-style)
-- ============================================

CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  member_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  boost_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE public.community_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#ffffff',
  position INTEGER DEFAULT 0,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  topic TEXT,
  channel_type TEXT DEFAULT 'text' CHECK (channel_type IN ('text','voice','event','announcement')),
  position INTEGER DEFAULT 0,
  category TEXT,
  is_nsfw BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.channels(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- LIVESTREAM
-- ============================================

CREATE TABLE public.livestreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  streamer_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT UNIQUE,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle','live','ended')),
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_gifts_value INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  replay_url TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.livestream_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestream_id UUID NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE(livestream_id, user_id)
);

CREATE TABLE public.livestream_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestream_id UUID NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.livestream_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestream_id UUID NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  gift_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  coin_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.livestream_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestream_a_id UUID NOT NULL REFERENCES public.livestreams(id),
  livestream_b_id UUID NOT NULL REFERENCES public.livestreams(id),
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','ended')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- ============================================
-- WALLET / ECONOMY
-- ============================================

CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance_coins INTEGER DEFAULT 0 CHECK (balance_coins >= 0),
  balance_fiat NUMERIC(12,2) DEFAULT 0 CHECK (balance_fiat >= 0),
  total_earned_coins INTEGER DEFAULT 0,
  total_spent_coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  tx_type TEXT NOT NULL CHECK (tx_type IN ('recharge','purchase','gift_sent','gift_received','withdrawal','subscription','ad_spend','refund','reward','transfer')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'coin' CHECK (currency IN ('coin','usd','vnd')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','cancelled')),
  reference_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.coin_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coins INTEGER NOT NULL,
  bonus_coins INTEGER DEFAULT 0,
  price_usd NUMERIC(8,2) NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon_url TEXT,
  coin_cost INTEGER NOT NULL,
  category TEXT DEFAULT 'standard',
  animation_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.gift_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gift_id UUID NOT NULL REFERENCES public.gifts(id),
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, gift_id)
);

CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  bank_info JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','processing','completed','rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.creator_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  source TEXT NOT NULL CHECK (source IN ('gift','subscription','ad_revenue','affiliate','tip')),
  amount INTEGER NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.premium_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  tier TEXT NOT NULL CHECK (tier IN ('plus','ultra','creator','business')),
  amount NUMERIC(8,2) NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ADVERTISEMENTS
-- ============================================

CREATE TABLE public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  budget_coins INTEGER NOT NULL,
  spent_coins INTEGER DEFAULT 0,
  target_audience JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed','rejected')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('feed','reel','story','livestream','banner')),
  content_id UUID,
  media_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cpc NUMERIC(6,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ad_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression','click','conversion','skip')),
  user_id UUID REFERENCES public.profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.boosted_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id),
  boost_multiplier FLOAT DEFAULT 1.5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AI
-- ============================================

CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  feature TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  feature TEXT NOT NULL,
  input_preview TEXT,
  output_preview TEXT,
  model TEXT DEFAULT 'gemini-2.0-flash',
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ai_moderation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post','comment','message','reel','livestream_chat','profile')),
  content_id UUID NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  categories JSONB DEFAULT '{}',
  confidence FLOAT DEFAULT 0,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  score FLOAT DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ADMIN / MODERATION
-- ============================================

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  reported_user_id UUID REFERENCES public.profiles(id),
  content_type TEXT,
  content_id UUID,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES public.profiles(id),
  target_user_id UUID REFERENCES public.profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('warn','mute','ban','shadow_ban','unban','delete_content','approve')),
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  ban_type TEXT DEFAULT 'full' CHECK (ban_type IN ('full','shadow','chat','livestream','posting')),
  reason TEXT,
  banned_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_posts_author ON public.posts(author_id, created_at DESC);
CREATE INDEX idx_posts_visibility ON public.posts(visibility, created_at DESC);
CREATE INDEX idx_posts_ai_score ON public.posts(ai_score DESC);
CREATE INDEX idx_comments_post ON public.comments(post_id, created_at);
CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_messages_room ON public.messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_room_members_user ON public.room_members(user_id);
CREATE INDEX idx_room_members_room ON public.room_members(room_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_stories_author ON public.stories(author_id, expires_at);
CREATE INDEX idx_reels_author ON public.reels(author_id, created_at DESC);
CREATE INDEX idx_reels_score ON public.reels(ai_score DESC);
CREATE INDEX idx_livestreams_status ON public.livestreams(status);
CREATE INDEX idx_transactions_user ON public.transactions(user_id, created_at DESC);
CREATE INDEX idx_admin_logs_admin ON public.admin_logs(admin_id, created_at DESC);
CREATE INDEX idx_ai_moderation_flagged ON public.ai_moderation(flagged, created_at DESC);
CREATE INDEX idx_ad_analytics_ad ON public.ad_analytics(ad_id, created_at DESC);
CREATE INDEX idx_community_members_user ON public.community_members(user_id);
