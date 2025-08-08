import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { categories, tools, getCategoryRanking } from "@/data/mock";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function Compare() {
  const [category, setCategory] = useState(categories[0].key);
  const [left, setLeft] = useState(tools[0].id);
  const [right, setRight] = useState(tools[1].id);

  const ranking = useMemo(() => getCategoryRanking(category, tools.length), [category]);
  const scoreOf = (id: string) => ranking.find((r) => r.toolId === id)?.score ?? 0;

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Compare AI Tools | AI Market Radar</title>
        <meta name="description" content="Side-by-side comparison of AI tools with category-specific scores." />
        <link rel="canonical" href={window.location.origin + "/compare"} />
      </Helmet>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Compare</h1>
        <p className="text-muted-foreground">Pick a category and two tools to compare.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-6 max-w-3xl">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={left} onValueChange={setLeft}>
          <SelectTrigger><SelectValue placeholder="Left Tool" /></SelectTrigger>
          <SelectContent>
            {tools.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={right} onValueChange={setRight}>
          <SelectTrigger><SelectValue placeholder="Right Tool" /></SelectTrigger>
          <SelectContent>
            {tools.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="font-semibold mb-2">{tools.find((t) => t.id === left)?.name}</h2>
          <p className="text-sm text-muted-foreground">Score in {categories.find((c) => c.key === category)?.label}</p>
          <p className="mt-2 text-4xl font-bold">{scoreOf(left)}</p>
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold mb-2">{tools.find((t) => t.id === right)?.name}</h2>
          <p className="text-sm text-muted-foreground">Score in {categories.find((c) => c.key === category)?.label}</p>
          <p className="mt-2 text-4xl font-bold">{scoreOf(right)}</p>
        </Card>
      </div>
    </div>
  );
}
