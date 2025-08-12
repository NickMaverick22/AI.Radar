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
  const [cats, setCats] = useState<Array<{ category: string; confidence?: number }>>([]);
  const [releases, setReleases] = useState<Array<{ id: string; version: string | null; release_date: string | null; notes_md: string | null; source_url: string | null }>>([]);
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const today = new Date().toISOString().slice(0, 10);
      const [toolRes, scoresRes, catsRes, relRes] = await Promise.all([
        supabase
          .from("tools")
          .select("id,name,vendor,homepage_url,description,is_oss")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("ranking_daily")
          .select("category, score_float")
          .eq("tool_id", id)
          .eq("as_of_date", today)
          .order("category", { ascending: true }),
        supabase
          .from("tool_categories")
          .select("category, confidence")
          .eq("tool_id", id)
          .order("category", { ascending: true }),
        supabase
          .from("releases")
          .select("id, version, release_date, notes_md, source_url")
          .eq("tool_id", id)
          .order("release_date", { ascending: false })
          .limit(5),
      ]);
      setTool((toolRes as any)?.data ?? null);
      setScores(((scoresRes as any)?.data as any) ?? []);
      setCats(((catsRes as any)?.data as any) ?? []);
      setReleases(((relRes as any)?.data as any) ?? []);
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
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.name,
            applicationCategory: cats.map((c) => c.category).join(', '),
            operatingSystem: 'All',
            url: tool.homepage_url || window.location.href,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          })}
        </script>
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
                <a className="underline" href={tool.homepage_url} target="_blank" rel="noopener noreferrer">Website</a>
              ) : (
                "Website: —"
              )}
            </li>
          </ul>
          {cats.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {cats.map((c) => (
                  <Badge key={c.category} variant="outline">{c.category}</Badge>
                ))}
              </div>
            </div>
          )}
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

      <section className="mt-8">
        <Card className="p-4">
          <h2 className="font-semibold mb-2">Recent Releases</h2>
          {releases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent releases found.</p>
          ) : (
            <ul className="divide-y">
              {releases.map((r) => (
                <li key={r.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.version ?? "Unversioned"}</div>
                      {r.release_date && (
                        <div className="text-muted-foreground">{new Date(r.release_date).toLocaleDateString()}</div>
                      )}
                    </div>
                    {r.source_url && (
                      <a href={r.source_url} target="_blank" rel="noreferrer" className="underline">Source</a>
                    )}
                  </div>
                  {r.notes_md && (
                    <p className="mt-2 text-muted-foreground line-clamp-2">{r.notes_md}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
