import OpenAI from 'openai';
import { supabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { ImageAsset } from '@/lib/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAndStoreImage(
  promptConcept: string,
  userId: string,
  draftId: string
): Promise<string> {
  const artisticPrompt = `
    Editorial illustration style for a professional LinkedIn post.
    Concept: ${promptConcept}
    Style: Modern flat vector art, "Humaaans" inspired, clean lines, minimal background.
    Colors: professional, balanced, suitable for business context.
    No text inside the image.
    Format: Square (1:1).
  `;

  try {
    // 1. Generazione DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: artisticPrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    });

    const b64Data = response.data[0].b64_json;
    if (!b64Data) {
      throw new Error('Image generation failed (missing b64_json)');
    }

    // 2. Upload su Supabase Storage
    const buffer = Buffer.from(b64Data, 'base64');
    const fileName = `${userId}/${draftId}_${uuidv4()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('post_images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from('post_images')
      .getPublicUrl(fileName);

    const publicUrl = publicData.publicUrl;
    if (!publicUrl) {
      throw new Error('Public URL not available for uploaded image');
    }

    // 3. Registra asset in image_assets
    const { error: insertError } = await supabase
      .from('image_assets')
      .insert({
        draft_id: draftId,
        url: publicUrl,
        description: promptConcept
      } satisfies Partial<ImageAsset>);

    if (insertError) {
      console.error('Error inserting image_asset record', insertError.message);
      // Non blocchiamo la pubblicazione solo per il record, ma logghiamo
    }

    // 4. Restituisci URL pubblico
    return publicUrl;
  } catch (error) {
    console.error('Image Service Error:', error);
    throw error;
  }
}
