import { Helmet } from "react-helmet-async";
import { updateLog } from "@/data/mock";

export default function Updates() {
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
        {updateLog.map((u, i) => (
          <li key={i} className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">{new Date(u.ts).toLocaleString()}</div>
            <div className="font-medium">{u.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
