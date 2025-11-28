import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { ImageAsset, PostDraft } from '@/lib/types';

function resolveUserId(request: Request): string | null {
  const url = new URL(request.url);
  return request.headers.get('x-user-id') || url.searchParams.get('user_id') || process.env.DEMO_USER_ID || null;
}

interface DraftUpdatePayload {
  edited_text?: string;
  status?: PostDraft['status'];
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = resolveUserId(request);
  const draftId = params.id;

  if (!userId || !draftId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('post_drafts')
    .select('*, image_assets(*)')
    .eq('id', draftId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    console.error('Draft fetch error', error?.message);
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  return NextResponse.json(data as PostDraft & { image_assets?: ImageAsset[] }, { status: 200 });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = resolveUserId(request);
  const draftId = params.id;

  if (!userId || !draftId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  let body: DraftUpdatePayload;
  try {
    body = (await request.json()) as DraftUpdatePayload;
  } catch (err) {
    console.error('Invalid payload', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const updates: Partial<PostDraft> = {};

  if (body.edited_text !== undefined) {
    updates.edited_text = body.edited_text;
  }

  if (body.status) {
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('post_drafts')
    .update(updates)
    .eq('id', draftId)
    .eq('user_id', userId)
    .select('*, image_assets(*)')
    .maybeSingle();

  if (error || !data) {
    console.error('Draft update error', error?.message);
    return NextResponse.json({ error: 'Unable to update draft' }, { status: 500 });
  }

  return NextResponse.json(data as PostDraft & { image_assets?: ImageAsset[] }, { status: 200 });
}
