import { Helmet } from "react-helmet-async";
import VoiceAdvisor from "@/components/VoiceAdvisor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const heroPointer = () => {
  const onMove = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100 + "%";
    const y = (e.clientY / 500) * 100 + "%";
    document.documentElement.style.setProperty("--pointer-x", x);
    document.documentElement.style.setProperty("--pointer-y", y);
  };
  window.addEventListener("mousemove", onMove);
  return () => window.removeEventListener("mousemove", onMove);
};

const Index = () => {
  const [logs, setLogs] = useState<Array<{ finished_at: string; job: string; status: string; info: any }>>([]);
  const [movers, setMovers] = useState<Array<{ tool_id: string; delta: number }>>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const cleanup = heroPointer();
    return cleanup;
  }, []);

  useEffect(() => {
    const load = async () => {
      const [{ data: logData }, { data: cats } , { data: today }] = await Promise.all([
        supabase.from("update_log").select("finished_at, job, status, info").order("finished_at", { ascending: false }).limit(20),
        supabase.from("admin_weights").select("category").order("category", { ascending: true }),
        supabase.from("ranking_daily").select("tool_id, delta_vs_yesterday_int").eq("as_of_date", new Date().toISOString().slice(0,10)).order("delta_vs_yesterday_int", { ascending: false }).limit(8),
      ]);
      setLogs((logData as any) ?? []);
      setCategories(((cats as any) ?? []).map((c: any) => c.category as string));
      setMovers(((today as any) ?? []).map((r: any) => ({ tool_id: r.tool_id as string, delta: r.delta_vs_yesterday_int as number })));
    };
    load();
  }, []);

  return (
    <div>
      <Helmet>
        <title>AI Market Radar — Daily AI Tool Rankings</title>
        <meta name="description" content="Track AI tool rankings across 24 categories. See top movers, compare tools, and use a voice advisor for recommendations." />
        <link rel="canonical" href={window.location.origin + "/"} />
      </Helmet>

      <section className="bg-radar-hero">
        <div className="container mx-auto py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight gradient-text">
              Daily AI Tool Rankings, Signals & Voice Recommendations
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Monitor categories, see movers, compare options, and get best practices—grounded with sources.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/rankings"><Button>Browse Rankings</Button></Link>
              <Link to="/compare"><Button variant="outline">Compare Tools</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y">
        <div className="container mx-auto overflow-hidden py-2">
          <div className="whitespace-nowrap animate-marquee flex gap-12 text-sm">
            {logs.map((u, i) => (
              <span key={i} className="text-muted-foreground">{new Date(u.finished_at).toLocaleTimeString()} — {u.job} {u.status}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-4">
            <h2 className="text-xl font-semibold">Top Movers (Today)</h2>
            <div className="mt-4 space-y-3">
              {movers.map((m) => (
                <div key={m.tool_id} className="flex items-center justify-between text-sm">
                  <Link to={`/tools/${m.tool_id}`} className="hover:underline">{m.tool_id}</Link>
                  <Badge variant={m.delta >= 0 ? "secondary" : "destructive"}>
                    {m.delta >= 0 ? `+${m.delta}` : m.delta}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Ask the Voice Advisor</h2>
            <p className="text-sm text-muted-foreground mt-1">Works with public or private ElevenLabs Agents using a secure signed URL.</p>
            <div className="mt-4"><VoiceAdvisor /></div>
          </Card>
        </div>
      </section>

      <section className="container mx-auto py-6">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((c) => (
            <Card key={c} className="p-4 transition-transform hover:translate-y-[-2px]">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{c}</h3>
                <Badge variant="secondary">Today</Badge>
              </div>
              <div className="mt-4">
                <Link to={`/rankings`}>
                  <Button size="sm" variant="outline">View full table</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
