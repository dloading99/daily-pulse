# Daily Pulse

Daily Pulse è un assistente editoriale AI-driven per professionisti che vogliono pubblicare su LinkedIn in pochi minuti mantenendo qualità e controllo umano. Questa iterazione introduce il prototipo **Slice 1 – Research → Insight** mobile-first basato su React + TypeScript + Tailwind.

## Come eseguire

```bash
npm install
npm run dev
```

Per build di produzione:

```bash
npm run build
```

## Variabili ambiente per LLM

Il deck degli insight usa un wrapper `llmClient` che richiama OpenAI se disponibile:

- `VITE_OPENAI_API_KEY`: chiave API.
- `VITE_OPENAI_MODEL` (opzionale): default `gpt-4o-mini`.

Se la chiave non è valorizzata, l’app usa un fallback locale per generare bullet e Pulse Score solo a scopo demo.

## Cosa include lo Slice 1

- Onboarding rapido con persistenza su `localStorage`.
- Calendario editoriale settimanale con card drag & drop (HTML5) per riordinare i temi.
- Insight Deck per il tema selezionato, alimentato da mock realistici (fonti: Bloomberg, HBR, MIT Tech Review, The Economist).
- Sintesi bullet + Pulse Score generati via wrapper LLM pronto per sostituire i mock con API reali.

Per dettagli di visione e UX consultare `docs/product-brief.md` e `docs/experience-blueprint.md`.
