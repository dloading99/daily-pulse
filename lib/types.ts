export type PostStatus = 'draft' | 'ready' | 'published' | 'scheduled';

export interface Profile {
  id: string;
  full_name?: string;
  role?: string;
  sector?: string;
  objective?: string;
  language?: string;
  brand_palette?: string;
  linkedin_access_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Topic {
  id: string;
  user_id: string;
  title: string;
  day_of_week: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Insight {
  id: string;
  user_id: string;
  topic_id?: string | null;
  title: string;
  url: string;
  source: string;
  published_date?: string | null;
  summary_bullets: string[];
  content?: string | null;
  pulse_score: number;
  created_at?: string;
}

export interface PostDraft {
  id: string;
  user_id: string;
  topic_id?: string | null;
  insight_ids: string[];
  generated_text: string;
  edited_text: string | null;
  status: PostStatus;
  linkedin_post_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ImageAsset {
  id: string;
  draft_id: string;
  url: string;
  description?: string | null;
  created_at?: string;
}

export interface AnalyticsSnapshot {
  id: string;
  draft_id?: string | null;
  linkedin_post_id?: string | null;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  captured_at?: string;
}

export interface InsightDTO {
  id?: string;
  title: string;
  url: string;
  source: string;
  date?: string;
  published_date?: string;
  summary_bullets: string[];
  pulseScore: number;
  content?: string | null;
}
