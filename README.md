<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xnuVcbMqvFuqIOf1Tr9uNP7ifggV5WTw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure `GEMINI_API_KEY` in `.env.local` with your AI Studio key (no quotes or surrounding whitespace). Optionally override `GEMINI_MODEL` (`gemini-pro` by default) or `GEMINI_EMBED_MODEL` (`textembedding-gecko-001`). The server will target `https://generativelanguage.googleapis.com/v1` so that `generateContent()` uses the GEMINI API surface with an API key.
3. Run the app:
   `npm run dev`

## Morgan Supabase Cutover (Vercel Multi-User)

1. Set environment variables in local `.env.local` and Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Apply SQL migration in Supabase SQL Editor:
   - `supabase/migrations/20260301_morgan_multitenant_persistence.sql`
3. Validate required Supabase tables:
   - `npm run morgan:check-schema`
4. Migrate existing file-backed Morgan data into Supabase:
   - `npm run morgan:migrate:file-to-supabase`
5. Consolidate legacy tender/document records into Morgan canonical tables:
   - `npm run morgan:migrate:legacy:tenders-docs`
6. Verify deploy readiness:
   - `npm run morgan:verify`

One-command path after SQL is applied:
- `npm run morgan:cutover`

Notes:
- Morgan APIs use Supabase as primary persistence and fall back to file store only if Supabase is unavailable.
- Tenant scope is enforced by `user_id` + `workspace_id` in persistence operations.
