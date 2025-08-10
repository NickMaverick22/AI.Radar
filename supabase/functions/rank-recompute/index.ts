import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function zscore(arr: number[]) {
  const m = arr.reduce((a, b) => a + b, 0) / Math.max(arr.length, 1);
  const sd = Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(arr.length, 1)) || 1;
  return arr.map((x) => (x - m) / sd);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const { data: signals, error: sigErr } = await supabase
      .from("ranking_signals_raw")
      .select("tool_id, category, as_of_date, signal_key, signal_value_float")
      .eq("as_of_date", today);
    if (sigErr) throw sigErr;

    const byCat: Record<string, Record<string, Record<string, number>>> = {};
    for (const s of signals ?? []) {
      byCat[s.category] ??= {};
      byCat[s.category][s.tool_id] ??= {};
      byCat[s.category][s.tool_id][s.signal_key] = s.signal_value_float;
    }

    const { data: weightsRows, error: wErr } = await supabase
      .from("admin_weights")
      .select("category, weight_json");
    if (wErr) throw wErr;
    const weights: Record<string, any> = Object.fromEntries(
      (weightsRows ?? []).map((r: any) => [r.category, r.weight_json])
    );

    const toWrite: any[] = [];

    for (const [category, toolMap] of Object.entries(byCat)) {
      const keys = new Set<string>();
      Object.values(toolMap).forEach((m) => Object.keys(m).forEach((k) => keys.add(k)));
      const keyArr = Array.from(keys);

      const normByTool: Record<string, Record<string, number>> = {};
      for (const key of keyArr) {
        const vals = Object.entries(toolMap).map(([_, sigs]) => (sigs as any)[key] ?? 0);
        const zs = zscore(vals);
        Object.keys(toolMap).forEach((toolId, idx) => {
          (normByTool[toolId] ||= {})[key] = zs[idx];
        });
      }

      const w =
        weights[category] ?? {
          performance: 0.25,
          adoption: 0.2,
          satisfaction: 0.2,
          innovation: 0.2,
          docs: 0.1,
          value: 0.05,
        };
      const bucketMap: Record<string, string> = {
        benchmarks: "performance",
        feature_coverage: "performance",
        reviews_avg: "satisfaction",
        reviews_volume: "adoption",
        releases_per_month: "innovation",
        docs_pages: "docs",
        price_value_index: "value",
        community_velocity: "adoption",
      };

      const scored = Object.entries(normByTool)
        .map(([tool_id, sigs]) => {
          let total = 0;
          for (const [k, v] of Object.entries(sigs)) total += (w[bucketMap[k] ?? "adoption"] ?? 0) * (v as number);
          return { tool_id, score: total };
        })
        .sort((a, b) => b.score - a.score);

      // Fetch yesterday ranks for delta
      const { data: yRows } = await supabase
        .from("ranking_daily")
        .select("tool_id, rank_int")
        .eq("category", category)
        .eq("as_of_date", yesterday);
      const yRank: Record<string, number> = {};
      for (const r of yRows ?? []) yRank[r.tool_id] = r.rank_int as number;

      scored.forEach((r, i) => {
        const todayRank = i + 1;
        const delta = yRank[r.tool_id] ? yRank[r.tool_id] - todayRank : 0;
        toWrite.push({
          tool_id: r.tool_id,
          category,
          as_of_date: today,
          score_float: r.score,
          rank_int: todayRank,
          delta_vs_yesterday_int: delta,
        });
      });
    }

    // Replace today's snapshot
    await supabase.from("ranking_daily").delete().eq("as_of_date", today);
    if (toWrite.length) await supabase.from("ranking_daily").insert(toWrite);

    await supabase
      .from("update_log")
      .insert({ job: "RANK_RECALC_DAILY", status: "success", info: { rows: toWrite.length } });

    return new Response(JSON.stringify({ ok: true, rows: toWrite.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    try {
      await createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
        .from("update_log")
        .insert({ job: "RANK_RECALC_DAILY", status: "error", info: { error: String(e) } });
    } catch {}
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
