import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { categories } from "@/data/mock";
import { RankingsTable } from "@/components/RankingsTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Rankings() {
  const [category, setCategory] = useState<string>(categories[0].key);

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>AI Rankings by Category | AI Market Radar</title>
        <meta name="description" content="Browse daily AI rankings across 24 categories. Sort by score and track rank deltas." />
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
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <RankingsTable categoryKey={category} />
    </div>
  );
}
