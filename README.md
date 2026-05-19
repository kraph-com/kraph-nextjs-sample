# kraph-nextjs-sample

End-to-end smoke-test for Kraph's one-click deploy flow.

This repo is purposely minimal — one Next.js app router page that reads from a Supabase `messages` table on every request. Deploying it through Kraph's "Deploy from GitHub" form exercises every step of the no-AI orchestrator:

1. **Provision** — `kraph_provision` spins up a fresh Postgres + Auth + Storage + Functions instance.
2. **Storage bucket** — `kraph_storage_create_bucket` auto-creates a public `deploys` bucket (used later by direct-upload MCP flows).
3. **Runtime env** — `kraph_set_env` writes any KEY=VALUE lines from the form's "Runtime env vars" textarea.
4. **Migrations** — every `migrations/*.sql` file applied in alphabetical order via `kraph_query`. This repo's `0001_init.sql` creates the `messages` table + seeds three rows.
5. **Edge functions** — every `functions/<name>/index.ts` deployed via `kraph_deploy_function`. (None in this demo, but the orchestrator handles them when present.)
6. **Build + ship** — `kraph_github_build_frontend` builds the Next.js standalone output with the form's "Build-time env vars" baked in and hands it to the per-instance Node sidecar.
7. **Auto-redeploy hook** — `kraph_github_connect` wires the repo so future pushes trigger a redeploy.

## What it does

`app/page.tsx` is a server component with `dynamic = "force-dynamic"`. Every page load runs server-side: opens a Supabase client using `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`, fetches `SELECT * FROM messages ORDER BY created_at DESC LIMIT 20`, renders the rows.

`migrations/0001_init.sql` creates the `messages` table with RLS enabled (anon SELECT allowed, writes blocked from the browser) and seeds three rows so the deployed page has visible output on first load.

## Deploying via Kraph one-click

1. Open `https://forge.kraph.com` and sign in.
2. Click **deploy from GitHub**, pick this repo on the dropdown (Kraph App must be installed on your org first), leave branch empty for default.
3. Click **continue →**. The detector should land on **Next.js (SSR)** with a green "detected" badge and prefill:
   - Framework target: `nextjs_service`
   - Install command: `pnpm install --frozen-lockfile` (or `npm ci ...` if no pnpm-lock)
   - Build command: `next build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`
   - Output dir: `.next/standalone`
   - Start command: `node server.js`
   - Counts line: **3 migrations**, **0 edge functions** (the SQL ones are counted from `migrations/`).
4. Expand **advanced**. Paste into **Build-time env vars**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<INSTANCE_ID>.kraph.com/api
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key kraph_provision will return>
   ```
   You'll need to come back and fill these in *after* the first deploy finishes (you don't have the instance id yet). Easiest path: leave them blank for the first deploy, watch the build log for the anon key in the `kraph_provision` tool-call-result, then redeploy via the "deploy from GitHub" button with the now-known values pasted in.
   
   Alternatively, do a `provision empty backend` first to get an instance + keys, then come back and run this flow with the keys preloaded.
5. Confirm **auto-redeploy on push** is checked. Click **deploy**.
6. Wait ~60-120s for the SSE stream to walk through provision → wait_ready → bucket → migrations → build → connect → done.
7. Open the live URL. You should see three seeded messages + a footer timestamp that updates on every reload.

## What this validates

| Capability | Where it shows up |
|---|---|
| `target=nextjs_service` SSR deploy | The page loads at all + the timestamp changes per reload |
| `output: "standalone"` build path | The build command runs cleanly + the sidecar starts |
| Build-time env injection | The Supabase URL shown in the subtitle matches what you pasted |
| Migrations orchestrator | The `messages` table exists + has the seed rows |
| Auto-redeploy on push | Editing this file + pushing should re-deploy without re-using the form |
| `kraph_node_service_logs` MCP tool | Force a crash (e.g. delete the anon key env var) → call the tool → see the boot-time error |

## Local development

```bash
npm install
export NEXT_PUBLIC_SUPABASE_URL=https://<your-instance>.kraph.com/api
export NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key from kraph_provision>
npm run dev
# open http://localhost:3000
```

## License

MIT.
