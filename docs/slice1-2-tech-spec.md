# Daily Pulse – Specifica tecnica (Slice 1 & 2, MVP v1.0)

## Contesto
Daily Pulse è un assistente editoriale AI-driven per LinkedIn. Lo scope di questa versione copre la routine **Tema del giorno → Insight → Bozza post → Editing → Pubblicazione** per le slice **Research & Insight** e **Ghostwriter AI**.

## Stack e architettura
- **Frontend/App:** Next.js 14+ (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** API Routes Next.js / Server Actions
- **Database:** Supabase (PostgreSQL + Auth)
- **AI:** OpenAI API (GPT-4o per testi)
- **News/Search:** API tipo Tavily (o analogo) con filtro domini & recency

Percorsi logici:
```
/app
  /(dashboard)
    /home          # Routine giornaliera: selezione insight
    /editor/[id]   # Editor bozza + pubblicazione
  /api
    /insights      # Endpoint per fetchDailyInsights
    /generate      # Endpoint per generatePostDraft
/lib
  ai-service.ts    # LOGICA GHOSTWRITER (FROZEN)
  news-service.ts  # LOGICA RICERCA INSIGHT
  types.ts
```

## Modello dati (Supabase/PostgreSQL)
### Tabelle principali per Slice 1 & 2
- **profiles**: estende `auth.users` con campi su ruolo, settore, lingua, obiettivo, palette brand e token LinkedIn.
- **topics**: temi editoriali con `day_of_week` e stato `is_active`.
- **insights**: insight salvati con fonte, titolo, URL, data, riassunti bullet, `pulse_score` e contenuto grezzo opzionale.
- **post_drafts**: bozze generate/edite con riferimenti a topic e insight, stato (`draft`, `ready`, `published`, `scheduled`), timestamp e link al post LinkedIn.
- **image_assets**: asset visivi associati ai draft (non usati direttamente in Slice 2).
- **analytics_snapshots**: snapshot metriche di post pubblicati con FK opzionale su draft.

Trigger: `update_post_drafts_modtime` aggiorna `updated_at` a ogni UPDATE su `post_drafts`.

## Slice 1 – Research & Insight Deck
### Obiettivo
Per utente loggato e tema del giorno: cercare fonti esterne autorevoli, costruire un deck di 3–5 insight, salvarli se necessario e restituirli ordinati alla UI.

### Fonti e vincoli
- Domini consentiti: `bloomberg.com`, `hbr.org`, `technologyreview.com`, `economist.com`.
- Finestra temporale: ultimi 7 giorni (estendibile in futuro).

### Funzione chiave `/lib/news-service.ts`
`fetchDailyInsights(topic: string): Promise<InsightDTO[]>` ritorna insight con campi `title`, `url`, `source` (Bloomberg/HBR/MIT Tech Review/The Economist/Fonte Autorevole), `date`, `summary_bullets` (1–3 bullet) e `pulseScore` (60–99).

### Pulse Score deterministico
`calculateDeterministicPulseScore(topic, title, content, source)`:
1. Base score: 60
2. Source bonus: +15 (HBR/The Economist), +10 (MIT Tech Review), +5 (Bloomberg), +0 default
3. Topic relevance: +10 se titolo contiene keyword significativa del topic (len > 3)
4. Content depth: +5 se `content.length > 1000`
5. Cap a 99

Output ordinato per `pulseScore` decrescente.

### Stati d'errore
Se ricerca fallisce o nessun risultato: restituire `[]`; la UI mostra “Nessun articolo trovato” e offre alternative (allargare finestra, cambiare tema, generare post solo da tema).

## Slice 2 – Ghostwriter AI (Generazione testo)
### Obiettivo
Dato un set di insight e il contesto utente (ruolo, settore, obiettivo), generare un post strutturato in 4 parti, rispettando struttura, tono e lunghezze, usando OpenAI in JSON mode.

### Funzione chiave `/lib/ai-service.ts`
`generatePostDraft(insights: string[], userContext: string, attempt = 1): Promise<PostStructure>` con schema Zod `{ hook, insight_body, human_connection, open_loop }`.

#### System prompt e tono
- Struttura obbligatoria: hook (max 2 frasi), insight_body (3–6 frasi, parafrasi analitica), human_connection (1–2 frasi esperienziali), open_loop (una domanda aperta, senza CTA vendita).
- Tono assertivo e professionale, no saluti formali, no slang fuori contesto, max 2 emoji coerenti.
- Safeguard: evitare contenuti discriminatori o politicamente esplosivi fuori contesto informativo.

#### Chiamata modello
Uso di `openai.beta.chat.completions.parse` con modello `gpt-4o-2024-08-06`, temperature 0.7, `response_format` impostato a `zodResponseFormat(PostStructureSchema, "post_draft")`. L'output è validato con Zod; in caso di errore si ritenta.

#### Vincoli di lunghezza e retry
Si sommano le lunghezze delle quattro parti separate da due newline. Se `totalLength > 1600` e `attempt < 2`, si rigenera chiedendo maggiore concisione. Se `totalLength < 600` e `attempt < 2`, si rigenera chiedendo di espandere verso target 700–1400. Al secondo tentativo l'output viene accettato.

## Gestione testi: `generated_text` vs `edited_text`
- Prima generazione: concatenare le 4 sezioni con doppie newline, salvare `generated_text`, `edited_text = NULL`, `status = 'draft'`, `insight_ids` e `topic_id` coerenti.
- Modifica editor: aggiornare `edited_text` con il contenuto utente.
- Pubblicazione: usare `edited_text` se presente, altrimenti fallback su `generated_text` copiandolo in `edited_text`; aggiornare `status = 'published'` e `linkedin_post_id`.

## Flusso end-to-end coperto
1. Home determina tema del giorno (da `topics`).
2. Chiamata `/api/insights` → `fetchDailyInsights` → Insight Deck ordinato.
3. Utente seleziona 1–3 insight e clicca “Genera bozza”.
4. Chiamata `/api/generate` → `generatePostDraft` → salvataggio in `post_drafts` con `generated_text` e `NULL edited_text`.
5. Redirect a `/editor/[id]` per editing/publishing.
6. In pubblicazione: applicare politica `edited_text` fallback, inviare a LinkedIn, aggiornare stato e ID post.

## Non obiettivi di questa fase
Non includere: scheduling avanzato, analytics evolute, voice match avanzato, pagine aziendali, integrazioni altri social.

## Criteri di Done
- `fetchDailyInsights` restituisce 3–5 insight ordinati per PulseScore da domini consentiti.
- `generatePostDraft` restituisce JSON valido con 4 parti e gestisce vincoli di lunghezza.
- UI consente di mostrare insight, selezione, generazione bozza, salvataggio draft, editing e pubblicazione con gestione corretta di `post_drafts`.
