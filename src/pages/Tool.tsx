import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export default function Tool() {
  const { id } = useParams<{ id: string }>();
  const [tool, setTool] = useState<any | null>(null);
  const [scores, setScores] = useState<Array<{ category: string; score_float: number }>>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [{ data: t }, { data: s }] = await Promise.all([
        supabase.from("tools").select("id,name,vendor,homepage_url,description,is_oss").eq("id", id).maybeSingle(),
        supabase
          .from("ranking_daily")
          .select("category, score_float")
          .eq("tool_id", id)
          .eq("as_of_date", new Date().toISOString().slice(0, 10))
          .order("category", { ascending: true }),
      ]);
      setTool(t ?? null);
      setScores((s as any) ?? []);
    };
    load();
  }, [id]);

  if (!tool) {
    return (
      <div className="container mx-auto py-12">
        <Helmet>
          <title>Tool not found | AI Market Radar</title>
          <meta name="description" content="The requested tool could not be found." />
        </Helmet>
        <p>Tool not found. <Link className="underline" to="/rankings">Back to Rankings</Link></p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>{tool.name} — Overview | AI Market Radar</title>
        <meta name="description" content={`Overview and category scores for ${tool.name}.`} />
        <link rel="canonical" href={window.location.origin + "/tools/" + tool.id} />
      </Helmet>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{tool.name}</h1>
        <p className="text-muted-foreground">{tool.description}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4">
          <h2 className="font-semibold mb-2">Details</h2>
          <ul className="text-sm space-y-1">
            <li>Vendor: {tool.vendor ?? "—"}</li>
            <li>Open source: {tool.is_oss ? "Yes" : "No"}</li>
            <li>
              {tool.homepage_url ? (
                <a className="underline" href={tool.homepage_url} target="_blank" rel="noreferrer">Website</a>
              ) : (
                "Website: —"
              )}
            </li>
          </ul>
        </Card>
        <Card className="p-4 md:col-span-2">
          <h2 className="font-semibold mb-2">Today’s Category Scores</h2>
          {scores.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scores yet for today.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {scores.map((c) => (
                <div key={c.category} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{c.category}</span>
                  <Badge variant="secondary">{Math.round(c.score_float)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
