import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generatePostDraft } from '@/lib/ai-service';
import type { Insight, PostDraft, Profile, Topic } from '@/lib/types';

interface GenerateRequest {
  insight_ids: string[];
  user_id?: string;
}

function resolveUserId(request: Request, body?: GenerateRequest): string | null {
  const url = new URL(request.url);
  return body?.user_id || request.headers.get('x-user-id') || url.searchParams.get('user_id') || process.env.DEMO_USER_ID || null;
}

async function fetchInsights(ids: string[], userId: string): Promise<Insight[]> {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .in('id', ids)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching insights', error.message);
    return [];
  }

  return (data as Insight[]) || [];
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) {
    console.error('Error fetching profile', error.message);
    return null;
  }
  return data as Profile | null;
}

async function fetchTodayTopic(userId: string): Promise<Topic | null> {
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

function buildUserContext(profile: Profile | null): string {
  if (!profile) return 'Professionista generico';
  const parts = [profile.role, profile.sector, profile.objective].filter(Boolean);
  return parts.join(' | ') || 'Professionista generico';
}

export async function POST(request: Request) {
  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: 'Payload non valido' }, { status: 400 });
  }

  const userId = resolveUserId(request, body);
  if (!userId) {
    return NextResponse.json({ error: 'Utente non riconosciuto' }, { status: 400 });
  }

  if (!body.insight_ids || body.insight_ids.length === 0) {
    return NextResponse.json({ error: 'Nessun insight selezionato' }, { status: 400 });
  }

  try {
    const [insights, profile, topic] = await Promise.all([
      fetchInsights(body.insight_ids, userId),
      fetchProfile(userId),
      fetchTodayTopic(userId)
    ]);

    if (!topic) {
      return NextResponse.json({ error: 'Tema non trovato' }, { status: 400 });
    }

    const insightTexts = insights.map((i) =>
      i.content?.slice(0, 800) || i.summary_bullets.join(' ')
    );

    const draft = await generatePostDraft(insightTexts, buildUserContext(profile));
    const fullText = `${draft.hook}\n\n${draft.insight_body}\n\n${draft.human_connection}\n\n${draft.open_loop}`;

    const { data, error } = await supabase
      .from('post_drafts')
      .insert({
        user_id: userId,
        topic_id: topic.id,
        insight_ids: body.insight_ids,
        generated_text: fullText,
        edited_text: null,
        status: 'draft'
      })
      .select('id')
      .maybeSingle();

    if (error || !data) {
      console.error('Error inserting draft', error?.message);
      return NextResponse.json({ error: 'Impossibile generare il post in questo momento' }, { status: 500 });
    }

    return NextResponse.json({ draftId: (data as PostDraft).id }, { status: 200 });
  } catch (error) {
    console.error('Unhandled /api/generate error', error);
    return NextResponse.json({ error: 'Impossibile generare il post in questo momento' }, { status: 500 });
  }
}
