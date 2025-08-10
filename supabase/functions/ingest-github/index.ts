import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE");
  const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: "Missing env" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: tools } = await supabase
      .from("tools")
      .select("id, name, description");

    for (const t of tools ?? []) {
      const desc = (t as any).description ?? "";
      const m = desc.match(/github\.com\/(\w[\w.-]*)\/(\w[\w.-]*)/i);
      if (!m) continue;
      const repo = `${m[1]}/${m[2]}`;

      const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "User-Agent": "ai-market-radar",
          Accept: "application/vnd.github+json",
        },
      });
      if (!res.ok) continue;
      const releases = await res.json();

      for (const r of (releases ?? []).slice(0, 5)) {
        await supabase.from("releases").upsert({
          tool_id: (t as any).id,
          version: r.tag_name ?? r.name ?? "unknown",
          release_date: r.published_at ? String(r.published_at).slice(0, 10) : null,
          notes_md: r.body ?? "",
          source_url: r.html_url ?? null,
          changelog_hash: r.body ? String(r.body.length) : null,
        });
      }

      const last30 = (releases ?? []).filter((r: any) => {
        const d = new Date(r.published_at);
        return (Date.now() - d.getTime()) / 86400000 <= 30;
      }).length;

      const { data: cats } = await supabase
        .from("tool_categories")
        .select("category")
        .eq("tool_id", (t as any).id);

      for (const c of cats ?? []) {
        await supabase.from("ranking_signals_raw").upsert({
          tool_id: (t as any).id,
          category: (c as any).category,
          as_of_date: today,
          signal_key: "releases_per_month",
          signal_value_float: last30,
        });
        await supabase.from("ranking_signals_raw").upsert({
          tool_id: (t as any).id,
          category: (c as any).category,
          as_of_date: today,
          signal_key: "community_velocity",
          signal_value_float: Math.min(last30 * 2, 10),
        });
      }
    }

    await supabase.from("update_log").insert({
      job: "INGEST_DAILY",
      status: "success",
      info: { source: "github_releases" },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    await supabase.from("update_log").insert({ job: "INGEST_DAILY", status: "error", info: { error: String(e) } });
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
