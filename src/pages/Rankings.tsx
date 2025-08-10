import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { RankingsTable } from "@/components/RankingsTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function Rankings() {
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("admin_weights")
        .select("category")
        .order("category", { ascending: true });
      if (error) {
        console.error("Failed to load categories", error);
        return;
      }
      const cats = (data ?? []).map((d: any) => d.category as string);
      setCategories(cats);
      if (!category && cats.length) setCategory(cats[0]);
    };
    load();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>AI Rankings by Category | AI Market Radar</title>
        <meta name="description" content="Browse daily AI rankings across categories. Sort by score and track rank deltas." />
        <link rel="canonical" href={window.location.origin + "/rankings"} />
      </Helmet>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Rankings</h1>
        <p className="text-muted-foreground">Daily updated snapshots across AI categories.</p>
      </header>
      <div className="mb-4 max-w-sm">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {category && <RankingsTable categoryKey={category} />}
    </div>
  );
}
