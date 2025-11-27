import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { publishToLinkedIn } from '@/lib/linkedin';
import type { PostDraft, Profile, ImageAsset } from '@/lib/types';

interface PublishRequest {
  draftId: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    const { draftId, userId } = (await request.json()) as PublishRequest;

    if (!draftId || !userId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    // 1. Recupera Draft + immagini collegate
    const { data: draft, error: draftError } = await supabase
      .from('post_drafts')
      .select('*, image_assets(*)')
      .eq('id', draftId)
      .eq('user_id', userId)
      .single();

    if (draftError || !draft) {
      console.error('Draft fetch error', draftError?.message);
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // 2. Recupera profilo per access token LinkedIn
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('linkedin_access_token')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error', profileError.message);
    }

    const typedDraft = draft as PostDraft & { image_assets?: ImageAsset[] };
    const typedProfile = profile as Profile | null;

    // 3. Determinazione testo finale (Policy)
    let finalText = typedDraft.edited_text;
    if (!finalText) {
      finalText = typedDraft.generated_text;
      await supabase
        .from('post_drafts')
        .update({ edited_text: finalText })
        .eq('id', draftId);
    }

    // 4. Immagine principale (se presente)
    const images = (typedDraft.image_assets ?? []) as ImageAsset[];
    const mainImage = images.length > 0 ? images[0].url : undefined;

    // 5. Pubblicazione su LinkedIn (stub)
    const accessToken = typedProfile?.linkedin_access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'LinkedIn not connected' },
        { status: 403 }
      );
    }

    const linkedinId = await publishToLinkedIn(accessToken, finalText, mainImage);

    // 6. Aggiorna stato draft
    await supabase
      .from('post_drafts')
      .update({
        status: 'published',
        linkedin_post_id: linkedinId
      })
      .eq('id', draftId);

    // 7. Snapshot analytics iniziale
    await supabase.from('analytics_snapshots').insert({
      draft_id: draftId,
      linkedin_post_id: linkedinId,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0
    });

    return NextResponse.json({ success: true, linkedinId }, { status: 200 });
  } catch (error) {
    console.error('Publish Error:', error);
    return NextResponse.json({ error: 'Publishing failed' }, { status: 500 });
  }
}
