import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryRanking, tools } from "@/data/mock";
import { Link } from "react-router-dom";

export function RankingsTable({ categoryKey }: { categoryKey: string }) {
  const ranking = getCategoryRanking(categoryKey, 15);

  const price = (toolId: string) => tools.find((t) => t.id === toolId)?.priceFromUsd ?? 0;
  const name = (toolId: string) => tools.find((t) => t.id === toolId)?.name ?? toolId;

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Tool</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Δ</TableHead>
            <TableHead>Price from</TableHead>
            <TableHead className="text-right">Links</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranking.map((r) => (
            <TableRow key={r.toolId}>
              <TableCell>{r.rank}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link to={`/tools/${r.toolId}`} className="font-medium hover:underline">
                    {name(r.toolId)}
                  </Link>
                  {r.rank <= 3 && <Badge variant="secondary">Top {r.rank}</Badge>}
                </div>
              </TableCell>
              <TableCell>{r.score}</TableCell>
              <TableCell>
                <Badge variant={r.delta >= 0 ? "secondary" : "destructive"}>
                  {r.delta >= 0 ? `+${r.delta}` : r.delta}
                </Badge>
              </TableCell>
              <TableCell>${price(r.toolId)}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <a href={tools.find((t) => t.id === r.toolId)?.homepageUrl} target="_blank" rel="noreferrer">
                    Visit
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
