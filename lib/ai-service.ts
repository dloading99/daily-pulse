import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

export const PostStructureSchema = z.object({
  hook: z.string(),
  insight_body: z.string(),
  human_connection: z.string(),
  open_loop: z.string()
});

export type PostStructure = z.infer<typeof PostStructureSchema>;

// System Prompt con sintassi corretta (Backticks)
export const SYSTEM_PROMPT = `Sei Ghostwriter, un assistente editoriale professionale specializzato in LinkedIn.
Genera contenuti rigorosamente in ITALIANO.

REGOLE STRUTTURALI OBBLIGATORIE:
- La risposta DEVE essere un JSON valido con le chiavi: hook, insight_body, human_connection, open_loop.
- hook: massimo 2 frasi, tono assertivo, niente saluti formali, VIETATO iniziare con frasi tipo "In questo post...", "Oggi parliamo di...".
- insight_body: 3–6 frasi, parafrasa e collega i punti principali degli insight, evita copia-incolla dei bullet.
- human_connection: 1–2 frasi personali o esperienziali collegate al contesto professionale dell’utente.
- open_loop: una domanda aperta che stimoli discussione, senza CTA di vendita (es. "contattami", "prenota una call", "link in bio", ecc.).

REGOLE DI TONO:
- Tono assertivo, professionale, chiaro, non accademico.
- No "Gentili colleghi" o saluti formali iniziali/finali.
- No slang fuori contesto business.
- Max 2 emoji coerenti, se utili.

SAFEGUARD:
- Evita contenuti discriminatori, d’odio o politicamente esplosivi fuori da un contesto informativo neutro.`;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePostDraft(
  insights: string[],
  userContext: string,
  attempt = 1
): Promise<PostStructure> {
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: `Crea un post LinkedIn in italiano seguendo la struttura obbligatoria.
Contesto utente: ${userContext}
Insight da usare:
- ${insights.join('\n- ')}`
    }
  ];

  const response = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-2024-08-06',
    temperature: 0.7,
    messages,
    response_format: zodResponseFormat(PostStructureSchema, 'post_draft')
  });

  const draft = response.choices[0].message.parsed;

  if (!draft) {
    console.error('Ghostwriter: output non conforme allo schema');
    throw new Error('Output non conforme allo schema');
  }

  const totalLength = `${draft.hook}\n\n${draft.insight_body}\n\n${draft.human_connection}\n\n${draft.open_loop}`.length;

  console.log(`[Ghostwriter] Attempt ${attempt}: ${totalLength} chars`);

  // Retry logic: MAX check
  if (totalLength > 1600 && attempt < 2) {
    return generatePostDraft(
      insights,
      `${userContext}\nFai la risposta più concisa mantenendo i punti chiave.`,
      attempt + 1
    );
  }

  // Retry logic: MIN check
  if (totalLength < 600 && attempt < 2) {
    return generatePostDraft(
      insights,
      `${userContext}\nEspandi leggermente l'analisi verso 700-1400 caratteri.`,
      attempt + 1
    );
  }

  return draft;
}
