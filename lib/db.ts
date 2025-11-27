import { createClient } from '@supabase/supabase-js';
import type { PostStatus, Profile, Topic, Insight, PostDraft, ImageAsset, AnalyticsSnapshot } from './types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are not set. Database operations will fail.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '', {
  auth: { autoRefreshToken: false, persistSession: false }
});

export type Tables = {
  profiles: Profile;
  topics: Topic;
  insights: Insight;
  post_drafts: PostDraft;
  image_assets: ImageAsset;
  analytics_snapshots: AnalyticsSnapshot;
};

export type TableName = keyof Tables;
