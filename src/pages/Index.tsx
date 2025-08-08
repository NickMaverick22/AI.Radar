import { Helmet } from "react-helmet-async";
import VoiceAdvisor from "@/components/VoiceAdvisor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { categories, getCategoryRanking, getTopMovers, updateLog } from "@/data/mock";
import { useEffect } from "react";

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
  useEffect(() => {
    const cleanup = heroPointer();
    return cleanup;
  }, []);

  const movers = getTopMovers("coding-devtools", 8);

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
              Monitor 24 categories, see movers, compare options, and get best practices—grounded with sources.
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
            {updateLog.map((u, i) => (
              <span key={i} className="text-muted-foreground">{new Date(u.ts).toLocaleTimeString()} — {u.text}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-4">
            <h2 className="text-xl font-semibold">Top Movers</h2>
            <div className="mt-4 space-y-3">
              {movers.map((m) => (
                <div key={m.toolId} className="flex items-center justify-between text-sm">
                  <Link to={`/tools/${m.toolId}`} className="hover:underline">{m.toolId}</Link>
                  <Badge variant={m.delta >= 0 ? "secondary" : "destructive"}>
                    {m.delta >= 0 ? `+${m.delta}` : m.delta}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Ask the Voice Advisor</h2>
            <p className="text-sm text-muted-foreground mt-1">Provide your ElevenLabs API key and an Agent ID to try live voice recommendations.</p>
            <div className="mt-4"><VoiceAdvisor /></div>
          </Card>
        </div>
      </section>

      <section className="container mx-auto py-6">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((c) => {
            const top3 = getCategoryRanking(c.key, 3);
            return (
              <Card key={c.key} className="p-4 transition-transform hover:translate-y-[-2px]">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{c.label}</h3>
                  <Badge variant="secondary">Top 3</Badge>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {top3.map((t) => (
                    <div key={t.toolId} className="flex items-center justify-between">
                      <span className="text-muted-foreground">#{t.rank}</span>
                      <Link to={`/tools/${t.toolId}`} className="font-medium hover:underline">{t.toolId}</Link>
                      <span className="text-muted-foreground">{t.score}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link to={`/rankings`}>
                    <Button size="sm" variant="outline">View full table</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Index;
