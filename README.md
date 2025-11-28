# Daily Pulse

AI-driven assistant for daily LinkedIn posts, covering the full flow from research to publishing (Research → Insight Deck → Ghostwriter → Image → Publish).

## Overview
Daily Pulse helps professionals ship consistent LinkedIn content by:
- Fetching high-quality articles from Bloomberg, Harvard Business Review, MIT Technology Review, and The Economist via Tavily.
- Scoring articles deterministically with a Pulse Score heuristic to highlight the most relevant insights.
- Letting the user pick up to 3 insights and generating a structured LinkedIn post via Ghostwriter AI.
- Optionally creating an editorial-style image with DALL·E 3 and storing it in Supabase Storage.
- Publishing to LinkedIn through a stub (MVP) while persisting drafts, images, and analytics snapshots in the database.

## Core Features (by Slice)
### Slice 1 – Research & Insight
- Fetch insights from Tavily (last 7 days) restricted to the allowed domains.
- Deterministic Pulse Score heuristic combining baseline, source bonus, topic relevance, and content depth.
- Persist insights per user/topic in the `insights` table.
- Insight Deck UI on `/home` to browse and select insights.

### Slice 2 – Ghostwriter AI
- Zod schema-enforced structure: `hook`, `insight_body`, `human_connection`, `open_loop`.
- SYSTEM_PROMPT rules:
  - Output strictly in Italian.
  - Structure: max 2-sentence hook; 3–6-sentence body; 1–2-sentence human connection; an open question without sales CTAs.
  - Tone: assertive, professional, no greetings, max 2 emoji, business-focused.
- Length checks accept outputs between ~600 and 1600 characters with one retry for over/under length.
- Drafts stored in `post_drafts` with `generated_text`, `edited_text`, `status`, `linkedin_post_id`.

### Slice 3 – Image & Publishing
- `generateAndStoreImage` uses DALL·E 3 with an editorial prompt (Humaaans-inspired flat vector, business-friendly, square, no text).
- Uploads to Supabase Storage bucket `post_images` (public read) and inserts records into `image_assets`.
- Publish API policy:
  - If `edited_text` is null at publish time, fallback to `generated_text` and persist it in `edited_text`.
  - Use the first available image as the main asset.
  - Call `publishToLinkedIn` (stub) and save `linkedin_post_id`.
  - Seed `analytics_snapshots` with zero metrics.

## Tech Stack
- Next.js 14+ (App Router) with TypeScript and React 18.
- Supabase (PostgreSQL, Auth, Storage).
- OpenAI API (GPT-4o and DALL·E 3).
- Tavily API for news and search.
- UUID for uploaded asset naming.

## Architecture Overview
- **App routes**: `/home` (Insight Deck), `/editor/[id]` (draft editor), and API routes under `/api` for insights, draft generation, draft CRUD, image generation, and publishing.
- **Service layer** (`/lib`):
  - `news-service` for Tavily search, source identification, and Pulse Score calculation.
  - `ai-service` for Ghostwriter prompt + schema + retry logic.
  - `image-service` for DALL·E prompt, storage upload, and `image_assets` insertion.
  - `linkedin` as the publishing stub.
  - `types` for shared domain types.
- **Database schema**: defined in `supabase/schema.sql`.
- Separation of concerns between data fetching (Tavily/DB), AI generation (Ghostwriter, DALL·E), and storage/publishing (Supabase Storage + LinkedIn stub).

## Database Schema (High-level)
- `profiles`: extends Supabase auth user with role, sector, objective, language, brand_palette, linkedin_access_token.
- `topics`: per-user daily topics (`day_of_week`, `is_active`).
- `insights`: fetched & scored insights per user/topic with `pulse_score`.
- `post_drafts`: drafts with `generated_text`, `edited_text`, `status` (`draft`, `ready`, `published`, `scheduled`), `linkedin_post_id`.
- `image_assets`: image URLs tied to drafts.
- `analytics_snapshots`: metrics per published post.
- `post_status` enum and `update_post_drafts_modtime` trigger keep draft states consistent.

## Setup & Installation
### Prerequisites
- Node.js >= 18 and npm or yarn.
- A Supabase project (apply `supabase/schema.sql`).
- OpenAI API key (GPT-4o + DALL·E 3 access).
- Tavily API key.

### Environment variables
- Copy `.env.example` to `.env.local` and fill in the values (see [Environment Variables](#environment-variables)).

### Steps
1. Clone the repo.
2. `cp .env.example .env.local` and populate your keys.
3. Apply `supabase/schema.sql` to your Supabase project.
4. Install dependencies: `npm install`.
5. Start dev server: `npm run dev` (defaults to `http://localhost:3000`).

> Note: Some sandbox environments can block npm registry access (HTTP 403). In a normal environment, standard install/build commands work as expected.

## How to Use
1. Configure a profile and weekly topics in the database (or via admin UI when available).
2. Open `/home` to view the Insight Deck for today’s topic.
3. Select up to three insights and click **Generate draft** to be redirected to `/editor/[id]`.
4. Review/edit the generated text and click **Save**.
5. Click **Generate image** to create an editorial illustration for the draft.
6. Click **Publish to LinkedIn**:
   - If `profiles.linkedin_access_token` is set, the stub publisher simulates posting, sets `status = 'published'`, and stores the LinkedIn URN.
   - An initial analytics snapshot is created.

## Environment Variables
See `.env.example` for a complete list. Key variables:
- `OPENAI_API_KEY` – OpenAI key for GPT-4o and DALL·E 3.
- `TAVILY_API_KEY` – Tavily key for news search.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` – Supabase service credentials (server-side use).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase client credentials (if exposing client-side access later).
- `DEMO_USER_ID` / `NEXT_PUBLIC_DEMO_USER_ID` – Optional fallback user ID for demo/local flows.

## Limitations & Next Steps
- LinkedIn integration is currently a stub; real publishing requires OAuth and proper scopes.
- No advanced scheduling or analytics dashboard yet.
- Future enhancements: topic calendar UI, richer analytics refresh, multi-account/role-based access.

## Troubleshooting
- Missing Tavily API key → `/api/insights` returns empty results.
- Missing OpenAI API key → `/api/generate` and image generation fail.
- Misconfigured Supabase credentials → API routes return DB errors or fail to persist data.
- npm registry 403 in constrained environments → infrastructure issue; retry in a standard networked environment.
