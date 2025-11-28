import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { Topic } from '@/lib/types';

function resolveUserId(request: Request): string | null {
  const url = new URL(request.url);
  return request.headers.get('x-user-id') || url.searchParams.get('user_id') || process.env.DEMO_USER_ID || null;
}

interface TopicPayload {
  id?: string;
  title: string;
  day_of_week: number;
  is_active: boolean;
}

interface TopicsUpdateBody {
  topics: TopicPayload[];
}

export async function GET(request: Request) {
  const userId = resolveUserId(request);

  if (!userId) {
    return NextResponse.json({ topics: [] }, { status: 200 });
  }

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true });

  if (error) {
    console.error('Error fetching topics', error.message);
    return NextResponse.json({ error: 'Unable to fetch topics' }, { status: 500 });
  }

  return NextResponse.json({ topics: (data || []) as Topic[] }, { status: 200 });
}

export async function PUT(request: Request) {
  const userId = resolveUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Missing user' }, { status: 400 });
  }

  let body: TopicsUpdateBody;
  try {
    body = (await request.json()) as TopicsUpdateBody;
  } catch (err) {
    console.error('Invalid topics payload', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (!body.topics || !Array.isArray(body.topics)) {
    return NextResponse.json({ error: 'Topics array is required' }, { status: 400 });
  }

  for (const topic of body.topics) {
    if (typeof topic.day_of_week !== 'number' || topic.day_of_week < 0 || topic.day_of_week > 6) {
      return NextResponse.json({ error: 'day_of_week must be between 0 and 6' }, { status: 400 });
    }
  }

  try {
    for (const topic of body.topics) {
      const payload = {
        title: topic.title,
        day_of_week: topic.day_of_week,
        is_active: topic.is_active,
        user_id: userId
      };

      if (topic.id) {
        const { error: updateError } = await supabase
          .from('topics')
          .update(payload)
          .eq('id', topic.id)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating topic', updateError.message);
          return NextResponse.json({ error: 'Unable to update topics' }, { status: 500 });
        }
      } else {
        const { error: insertError } = await supabase.from('topics').insert(payload);
        if (insertError) {
          console.error('Error inserting topic', insertError.message);
          return NextResponse.json({ error: 'Unable to save topics' }, { status: 500 });
        }
      }
    }

    const { data: refreshed, error: fetchError } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', userId)
      .order('day_of_week', { ascending: true });

    if (fetchError) {
      console.error('Error fetching updated topics', fetchError.message);
      return NextResponse.json({ error: 'Unable to fetch topics' }, { status: 500 });
    }

    return NextResponse.json({ topics: (refreshed || []) as Topic[] }, { status: 200 });
  } catch (err) {
    console.error('Unhandled topics update error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
