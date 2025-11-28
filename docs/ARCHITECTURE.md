# Architecture

## High-level Flow
- **Topic of the day** → resolved from `topics` by `/api/insights` using the authenticated/demo user.
- `/api/insights` calls Tavily via `lib/news-service`, scores and upserts into `insights`.
- `/home` renders the Insight Deck from stored insights and lets the user pick up to 3.
- `/api/generate` retrieves the selected insights + profile/context, calls Ghostwriter (`lib/ai-service`), and saves a new `post_drafts` row.
- `/editor/[id]` loads the draft, enables editing, saving, image generation, and publishing.
- `/api/drafts/[id]/image` builds a DALL·E prompt, uploads to Supabase Storage, and inserts `image_assets`.
- `/api/publish` enforces the text policy, calls the LinkedIn stub, updates `post_drafts`, and seeds `analytics_snapshots`.

## Domain Model
- **profiles**: Supabase-auth users enriched with role, sector, objective, language, brand palette, LinkedIn token.
- **topics**: Weekly assignments (`day_of_week`, `is_active`) linked to a profile. One profile → many topics.
- **insights**: Articles fetched per topic/user with deterministic `pulse_score`. Topic → many insights.
- **post_drafts**: Ghostwriter outputs per user/topic with `generated_text`, `edited_text`, `status`, `linkedin_post_id`. Profile → many drafts.
- **image_assets**: Public URLs and descriptions of generated images. Draft → many image assets.
- **analytics_snapshots**: Metrics over time for published posts. Draft → many snapshots.
- **Relationships**: `profiles` 1–N `topics`; `topics` 1–N `insights`; `profiles` 1–N `post_drafts`; `post_drafts` 1–N `image_assets`; `post_drafts` 1–N `analytics_snapshots`.

## Service Layer
### `lib/news-service.ts`
- `fetchDailyInsights(topic)` posts to Tavily with allowed domains (Bloomberg, HBR, MIT Technology Review, The Economist) and the last 7 days filter; maps results to internal DTOs.
- `identifySource(url)` normalizes hostnames and returns a human label for known domains.
- `calculateDeterministicPulseScore(topic, title, content, source)` heuristic: baseline 60 + source bonus (Harvard/The Economist +15, Tech Review +10, Bloomberg +5), +10 if the topic keyword is in the title, +5 for long content; capped at 99.
- Summaries are extracted from the first sentences and limited to three bullets.

### `lib/ai-service.ts`
- `SYSTEM_PROMPT` enforces Italian output, JSON structure (`hook`, `insight_body`, `human_connection`, `open_loop`), tone rules (assertive, professional, ≤2 emoji, no greetings/sales CTA), and sentence-count constraints per section.
- Uses OpenAI chat completions with Zod `PostStructureSchema` to validate shape.
- Length guardrails: computes total characters; if >1600 or <600, retries once with instructions to shorten/expand, ensuring consistent LinkedIn-ready posts.

### `lib/image-service.ts`
- Builds an editorial illustration prompt (Humaaans-inspired flat vector, business-friendly palette, square 1:1, no text) based on the draft text.
- Calls DALL·E 3, decodes `b64_json`, uploads PNG to Supabase Storage bucket `post_images` with user/draft prefix and UUID, then retrieves the public URL.
- Inserts a record into `image_assets` (non-blocking if insertion fails) and returns the public URL.

### `lib/linkedin.ts`
- Stub `publishToLinkedIn(accessToken, text, imageUrl?)` logs payload, simulates latency, and returns a fake URN. Replace with real LinkedIn API calls (w_member_social) in production.

## API Endpoints
### `app/api/insights/route.ts`
- **GET**: headers `x-user-id` or query `user_id` (fallback `DEMO_USER_ID`). Looks up today’s active topic, calls Tavily, upserts new insights, and returns `{ insights, topicTitle }` sorted by `pulse_score`.

### `app/api/generate/route.ts`
- **POST**: JSON `{ insight_ids: string[], user_id? }` plus optional header/query user. Fetches selected insights, profile, and today’s topic. Generates Ghostwriter draft text, inserts into `post_drafts` with `status='draft'`, returns `{ draftId }`.

### `app/api/drafts/[id]/route.ts`
- **GET**: header/query `user_id` lookup. Returns draft with related `image_assets` for the user.
- **PUT**: JSON `{ edited_text?, status? }` for the user-owned draft; updates fields and returns updated draft + images.

### `app/api/drafts/[id]/image/route.ts`
- **POST**: header/query `user_id`. Loads draft text (prefers `edited_text`, else `generated_text`), builds a prompt concept, generates image via `generateAndStoreImage`, and returns `{ imageUrl }`.

### `app/api/publish/route.ts`
- **POST**: JSON `{ draftId, userId }`. Loads draft + images and profile for LinkedIn token.
- Policy: if `edited_text` is null, copy `generated_text` into `edited_text` before publishing.
- Uses the first image (if present) as the main asset, calls `publishToLinkedIn`, updates draft `status` to `published` with `linkedin_post_id`, and inserts an initial `analytics_snapshots` row with zero metrics.

## Data Policy: `generated_text` vs `edited_text`
- Generation sets `generated_text`; `edited_text` starts as null.
- User edits via editor → `edited_text` updated.
- Publish: if `edited_text` is null, copy `generated_text` into `edited_text` to persist the exact live copy; set status to `published` and store the LinkedIn ID.

## Extensibility Notes
- **LinkedIn**: Replace `lib/linkedin.ts` with a real client (OAuth, w_member_social scope); maintain the publish contract in `/api/publish`.
- **Analytics**: Add background jobs to refresh metrics from LinkedIn and append to `analytics_snapshots` for time-series tracking.
- **Access & multi-tenancy**: Extend `profiles` with roles, introduce org/team scoping, and gate API routes by authenticated Supabase session instead of demo headers.
- **Topic/calendar UX**: Build UI for topic scheduling and rotation, enabling non-technical users to manage `topics` without direct DB edits.
