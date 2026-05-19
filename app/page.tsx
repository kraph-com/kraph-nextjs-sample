import { supabase } from "@/lib/supabase";

// Force SSR on every request — this exercises Kraph's per-instance Node
// sidecar (target=nextjs_service). With `export const dynamic = "force-dynamic"`
// Next.js can NOT statically generate this page; the sidecar must run for
// every visit.
export const dynamic = "force-dynamic";

interface Message {
  id: number;
  body: string;
  created_at: string;
}

async function loadMessages(): Promise<{
  rows: Message[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, body, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    return { rows: [], error: error.message };
  }
  return { rows: (data ?? []) as Message[], error: null };
}

export default async function Page() {
  const { rows, error } = await loadMessages();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(unset)";
  const renderedAt = new Date().toISOString();

  return (
    <main>
      <h1>
        <span className="accent">kraph</span> · Next.js + Supabase demo
      </h1>
      <p className="subtitle">
        Server-rendered every request. Reads from{" "}
        <code style={{ fontSize: 12 }}>{supabaseUrl}</code>.
      </p>

      {error && (
        <div className="card error">
          <div className="meta">SUPABASE ERROR</div>
          <div className="body">{error}</div>
          <div className="meta" style={{ marginTop: 8 }}>
            Most likely: the migration didn&apos;t run (no <code>messages</code>{" "}
            table) or env vars are wrong. Check the deploy log on
            /build/&lt;project-id&gt;.
          </div>
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="card">
          <div className="meta">NO MESSAGES YET</div>
          <div className="body">
            The migration ran (or there&apos;d be an error above) but the
            seed data is missing. Insert one with{" "}
            <code>INSERT INTO messages (body) VALUES (&apos;hello kraph&apos;);</code>{" "}
            in Studio.
          </div>
        </div>
      )}

      {rows.map((row) => (
        <div key={row.id} className="card">
          <div className="meta">
            #{row.id} · {new Date(row.created_at).toLocaleString()}
          </div>
          <div className="body">{row.body}</div>
        </div>
      ))}

      <footer>
        Rendered at <code>{renderedAt}</code> · this timestamp updates on
        every reload, proving the page is SSR (not statically prerendered).
      </footer>
    </main>
  );
}
