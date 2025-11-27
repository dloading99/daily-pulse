import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { fetchDailyInsights } from '@/lib/news-service';
import type { Insight, Topic } from '@/lib/types';

function resolveUserId(request: Request): string | null {
  const url = new URL(request.url);
  return request.headers.get('x-user-id') || url.searchParams.get('user_id') || process.env.DEMO_USER_ID || null;
}

async function getTodayTopic(userId: string): Promise<Topic | null> {
  const today = new Date().getDay();
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', userId)
    .eq('day_of_week', today)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching topic', error.message);
    return null;
  }

  return data as Topic | null;
}

export async function GET(request: Request) {
  const userId = resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ insights: [] }, { status: 200 });
  }

  try {
    const topic = await getTodayTopic(userId);
    if (!topic) {
      return NextResponse.json({ insights: [] }, { status: 200 });
    }

    const rawInsights = await fetchDailyInsights(topic.title);
    const insightsToUpsert = rawInsights.map((i) => ({
      user_id: userId,
      topic_id: topic.id,
      title: i.title,
      url: i.url,
      source: i.source,
      published_date: i.published_date || new Date().toISOString(),
      summary_bullets: i.summary_bullets,
      content: i.content ?? null,
      pulse_score: i.pulseScore
    }));

    const savedInsights: Insight[] = [];

    for (const item of insightsToUpsert) {
      const { data: existing, error: existingError } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', userId)
        .eq('url', item.url)
        .maybeSingle();

      if (existingError) {
        console.error('Error checking existing insight', existingError.message);
        continue;
      }

      if (existing) {
        savedInsights.push({ ...existing, ...item, id: existing.id });
        continue;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('insights')
        .insert(item)
        .select('*')
        .maybeSingle();

      if (insertError || !inserted) {
        console.error('Error inserting insight', insertError?.message);
        continue;
      }

      savedInsights.push(inserted as Insight);
    }

    const sorted = savedInsights.sort((a, b) => b.pulse_score - a.pulse_score);
    return NextResponse.json({ insights: sorted }, { status: 200 });
  } catch (error) {
    console.error('Unhandled /api/insights error', error);
    return NextResponse.json({ insights: [] }, { status: 200 });
  }
}
