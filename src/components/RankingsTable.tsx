import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface RankRow {
  tool_id: string;
  score_float: number;
  rank_int: number;
  delta_vs_yesterday_int: number;
  tools?: { name: string; homepage_url: string | null };
}

export function RankingsTable({ categoryKey }: { categoryKey: string }) {
  const [rows, setRows] = useState<RankRow[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const asOf = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("ranking_daily")
        .select("tool_id, score_float, rank_int, delta_vs_yesterday_int, tools(name, homepage_url)")
        .eq("category", categoryKey)
        .eq("as_of_date", asOf)
        .order("rank_int", { ascending: true });
      if (!active) return;
      if (error) {
        console.error("Failed to load rankings", error);
        setRows([]);
        return;
      }
      setRows(data as any);
    };
    load();
    return () => {
      active = false;
    };
  }, [categoryKey]);

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Tool</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Δ</TableHead>
            <TableHead className="text-right">Links</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.tool_id}>
              <TableCell>{r.rank_int}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link to={`/tools/${r.tool_id}`} className="font-medium hover:underline">
                    {r.tools?.name ?? r.tool_id}
                  </Link>
                  {r.rank_int <= 3 && <Badge variant="secondary">Top {r.rank_int}</Badge>}
                </div>
              </TableCell>
              <TableCell>{Math.round(r.score_float)}</TableCell>
              <TableCell>
                <Badge variant={r.delta_vs_yesterday_int >= 0 ? "secondary" : "destructive"}>
                  {r.delta_vs_yesterday_int >= 0 ? `+${r.delta_vs_yesterday_int}` : r.delta_vs_yesterday_int}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {r.tools?.homepage_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={r.tools.homepage_url} target="_blank" rel="noreferrer">
                      Visit
                    </a>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

