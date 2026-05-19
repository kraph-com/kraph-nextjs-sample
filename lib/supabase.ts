import { createClient } from "@supabase/supabase-js";

// Build-time env: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
// are baked into the client bundle by Next.js. On Kraph, you set these
// on the deploy form's "Build-time env vars" textarea — they get passed
// through to kraph_github_build_frontend's `env_vars` param so they're
// available at `next build` time.
//
// For server-only access (writes that bypass RLS), set SUPABASE_SERVICE_ROLE_KEY
// in the "Runtime env vars" textarea. The Next.js sidecar reads it at
// request time via process.env.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Surface the misconfiguration immediately rather than letting the
  // page hang with a confusing fetch error. The Kraph deploy form's
  // build log will show this if you forget the env vars.
  console.error(
    "[kraph-nextjs-supabase-demo] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY at build time. " +
      "Set both in the Kraph deploy form's 'Build-time env vars' textarea.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
