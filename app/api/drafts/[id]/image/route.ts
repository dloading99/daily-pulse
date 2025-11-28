import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateAndStoreImage } from '@/lib/image-service';
import type { PostDraft } from '@/lib/types';

function resolveUserId(request: Request): string | null {
  const url = new URL(request.url);
  return request.headers.get('x-user-id') || url.searchParams.get('user_id') || process.env.DEMO_USER_ID || null;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = resolveUserId(request);
  const draftId = params.id;

  if (!userId || !draftId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const { data: draft, error } = await supabase
    .from('post_drafts')
    .select('id, user_id, generated_text, edited_text')
    .eq('id', draftId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !draft) {
    console.error('Draft fetch error', error?.message);
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const typedDraft = draft as Pick<PostDraft, 'generated_text' | 'edited_text' | 'user_id'>;
  const promptSource = typedDraft.edited_text || typedDraft.generated_text;

  if (!promptSource) {
    return NextResponse.json({ error: 'No content to describe image' }, { status: 400 });
  }

  const promptConcept = promptSource.slice(0, 240);

  try {
    const imageUrl = await generateAndStoreImage(promptConcept, userId, draftId);
    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (err) {
    console.error('Image generation error', err);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
