import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Updates() {
  const [logs, setLogs] = useState<Array<{ finished_at: string; job: string; status: string }>>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.functions.invoke("public-update-log");
      if (error) {
        console.error("Failed to load update log", error);
        return;
      }
      setLogs(((data as any)?.logs ?? []) as any);
    };
    load();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Update Log | AI Market Radar</title>
        <meta name="description" content="Latest refreshes, new releases, and index rebuilds." />
        <link rel="canonical" href={window.location.origin + "/updates"} />
      </Helmet>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Update Log</h1>
        <p className="text-muted-foreground">Last successful refresh times and highlights.</p>
      </header>
      <ul className="space-y-3">
        {logs.map((u, i) => (
          <li key={i} className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">{new Date(u.finished_at).toLocaleString()}</div>
            <div className="font-medium">{u.job} — {u.status}</div>
            
          </li>
        ))}
      </ul>
    </div>
  );
}
