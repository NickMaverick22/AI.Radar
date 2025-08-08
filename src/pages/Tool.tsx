import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { getTool, categories, scoreFor } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Tool() {
  const { id } = useParams<{ id: string }>();
  const tool = id ? getTool(id) : undefined;

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
        <meta name="description" content={`Overview, pricing, and category scores for ${tool.name}.`} />
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
            <li>Vendor: {tool.vendor}</li>
            <li>Open source: {tool.oss ? "Yes" : "No"}</li>
            <li>Price from: ${tool.priceFromUsd}/mo</li>
            <li><a className="underline" href={tool.homepageUrl} target="_blank" rel="noreferrer">Website</a></li>
          </ul>
        </Card>
        <Card className="p-4 md:col-span-2">
          <h2 className="font-semibold mb-2">Category Scores</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.slice(0, 9).map((c) => (
              <div key={c.key} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>{c.label}</span>
                <Badge variant="secondary">{scoreFor(tool.id, c.key)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
