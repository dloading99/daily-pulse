import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { Profile } from '@/lib/types';

function resolveUserId(request: Request): string | null {
  const url = new URL(request.url);
  return request.headers.get('x-user-id') || url.searchParams.get('user_id') || process.env.DEMO_USER_ID || null;
}

const ALLOWED_FIELDS: Array<keyof Profile> = [
  'full_name',
  'role',
  'sector',
  'objective',
  'language',
  'brand_palette',
  'linkedin_access_token'
];

export async function GET(request: Request) {
  const userId = resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ profile: null }, { status: 200 });
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    console.error('Error fetching profile', error.message);
    return NextResponse.json({ error: 'Unable to fetch profile' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ profile: null }, { status: 200 });
  }

  return NextResponse.json({ profile: data as Profile }, { status: 200 });
}

export async function PUT(request: Request) {
  const userId = resolveUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Missing user' }, { status: 400 });
  }

  let payload: Partial<Profile>;
  try {
    payload = (await request.json()) as Partial<Profile>;
  } catch (err) {
    console.error('Invalid profile payload', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const updates: Partial<Profile> = {};
  for (const field of ALLOWED_FIELDS) {
    if (payload[field] !== undefined) {
      updates[field] = payload[field];
    }
  }

  try {
    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing profile', existingError.message);
      return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 });
    }

    if (!existing) {
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, ...updates })
        .select('*')
        .maybeSingle();

      if (insertError || !inserted) {
        console.error('Error inserting profile', insertError?.message);
        return NextResponse.json({ error: 'Unable to save profile' }, { status: 500 });
      }

      return NextResponse.json({ profile: inserted as Profile }, { status: 200 });
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ profile: existing as Profile }, { status: 200 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (updateError || !updated) {
      console.error('Error updating profile', updateError?.message);
      return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: updated as Profile }, { status: 200 });
  } catch (err) {
    console.error('Unhandled profile update error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
