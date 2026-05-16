-- ============================================
-- TCK CHAT — Advanced Schema Expansion
-- Adds: search, audit, analytics, wallet ledger,
-- streaks, achievements, edit history, scheduled content
-- ============================================

-- ============================================
-- DOUBLE-ENTRY WALLET LEDGER
-- ============================================

CREATE TABLE public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_id UUID NOT NULL REFERENCES public.transactions(id),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id),
  debit INTEGER DEFAULT 0 CHECK (debit >= 0),
  credit INTEGER DEFAULT 0 CHECK (credit >= 0),
  balance_after INTEGER NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('debit','credit')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wallet_ledger_wallet ON public.wallet_ledger(wallet_id, created_at DESC);
CREATE INDEX idx_wallet_ledger_tx ON public.wallet_ledger(tx_id);

-- ============================================
-- MESSAGE EDIT HISTORY
-- ============================================

CREATE TABLE public.message_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_message_edits ON public.message_edits(message_id, edited_at DESC);

-- ============================================
-- SCHEDULED CONTENT
-- ============================================

CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_data JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','published','failed','cancelled')),
  published_post_id UUID REFERENCES public.posts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scheduled_posts_status ON public.scheduled_posts(status, scheduled_for);

-- ============================================
-- GAMIFICATION
-- ============================================

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE public.daily_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL DEFAULT CURRENT_DATE,
  actions_count INTEGER DEFAULT 1,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, streak_date)
);

CREATE INDEX idx_daily_streaks ON public.daily_streaks(user_id, streak_date DESC);

CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT DEFAULT 'daily' CHECK (mission_type IN ('daily','weekly','seasonal','special')),
  reward_xp INTEGER DEFAULT 0,
  reward_coins INTEGER DEFAULT 0,
  requirement JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, mission_id)
);

-- ============================================
-- SEARCH / FULL-TEXT
-- ============================================

CREATE TABLE public.search_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post','reel','user','community','hashtag')),
  content_id UUID NOT NULL,
  search_text TSVECTOR NOT NULL,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_search_fts ON public.search_index USING gin(search_text);
CREATE INDEX idx_search_type ON public.search_index(content_type);

-- ============================================
-- ANALYTICS AGGREGATION
-- ============================================

CREATE TABLE public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_key TEXT,
  value BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  UNIQUE(date, metric_type, metric_key)
);

CREATE INDEX idx_analytics_daily ON public.analytics_daily(date DESC, metric_type);

CREATE TABLE public.content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post','reel','livestream','story')),
  content_id UUID NOT NULL,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  avg_watch_time_sec FLOAT DEFAULT 0,
  completion_rate FLOAT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  share_rate FLOAT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_type, content_id)
);

CREATE INDEX idx_content_analytics ON public.content_analytics(content_type, content_id);

-- ============================================
-- AUDIT TRAIL
-- ============================================

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  actor_type TEXT DEFAULT 'user' CHECK (actor_type IN ('user','admin','system','cron')),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_actor ON public.audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource_type, resource_id);

-- ============================================
-- SOFT DELETE SUPPORT
-- ============================================

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX idx_posts_soft_delete ON public.posts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_soft_delete ON public.comments(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- LIVESTREAM ENHANCEMENTS
-- ============================================

CREATE TABLE public.livestream_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestream_id UUID NOT NULL REFERENCES public.livestreams(id),
  clipper_id UUID NOT NULL REFERENCES public.profiles(id),
  clip_url TEXT NOT NULL,
  title TEXT,
  start_sec INTEGER NOT NULL,
  end_sec INTEGER NOT NULL,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.livestream_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  streamer_id UUID NOT NULL REFERENCES public.profiles(id),
  subscriber_id UUID NOT NULL REFERENCES public.profiles(id),
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic','premium','vip')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(streamer_id, subscriber_id)
);

-- ============================================
-- STICKERS & EMOJI PACKS
-- ============================================

CREATE TABLE public.sticker_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  creator_id UUID REFERENCES public.profiles(id),
  cover_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  price_coins INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_id UUID NOT NULL REFERENCES public.sticker_packs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  emoji_code TEXT,
  position INTEGER DEFAULT 0
);

CREATE TABLE public.user_sticker_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES public.sticker_packs(id),
  acquired_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, pack_id)
);

-- ============================================
-- REFERRAL SYSTEM
-- ============================================

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  referred_id UUID NOT NULL REFERENCES public.profiles(id),
  reward_coins INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_id)
);

-- ============================================
-- ADDITIONAL RLS
-- ============================================

ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own ledger" ON public.wallet_ledger FOR SELECT
  USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));

CREATE POLICY "Users see own edits" ON public.message_edits FOR SELECT
  USING (message_id IN (SELECT id FROM public.messages WHERE sender_id = auth.uid()));

CREATE POLICY "Users manage own scheduled" ON public.scheduled_posts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own achievements" ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own streaks" ON public.daily_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own missions" ON public.user_missions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Content analytics are public" ON public.content_analytics FOR SELECT
  USING (true);
