import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock, FileText, CircleDashed } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STORE_INFO } from "@/data/products";
import type { Store } from "@/types";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";

type UploadStatus = "queued" | "processing" | "done" | "failed";

type RecentUploadRow = {
  id: string;
  store: Store;
  file_name: string;
  created_at: string;
  status: string;
  products_found: number | null;
};

function toUploadStatus(raw: string): UploadStatus {
  switch (raw) {
    case "processing":
      return "processing";
    case "completed":
      return "done";
    case "failed":
      return "failed";
    default:
      return "queued";
  }
}

function StatusIcon({ status }: { status: UploadStatus }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "processing":
      return <Clock className="h-4 w-4 text-warning animate-pulse" />;
    case "queued":
    default:
      return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge({ status }: { status: UploadStatus }) {
  if (status === "done") return <Badge variant="success">Done</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (status === "processing") return <Badge variant="warning">Processing</Badge>;
  return <Badge variant="secondary">Queued</Badge>;
}

export function RecentUploadsCard() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["brochure_uploads", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brochure_uploads")
        .select("id, store, file_name, created_at, status, products_found")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return (data ?? []) as RecentUploadRow[];
    },
  });

  const rows = useMemo(() => {
    return (data ?? []).map((r) => ({
      ...r,
      uiStatus: toUploadStatus(r.status),
      createdAt: new Date(r.created_at),
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg">Recent uploads</CardTitle>
          <CardDescription>Brochure processing status (queued/processing/done/failed)</CardDescription>
        </div>

        {isAdmin && (
          <Button asChild size="sm" variant="secondary" className="shrink-0">
            <Link to="/admin">Upload</Link>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading uploads…</div>
        ) : error ? (
          <div className="text-sm text-destructive">Couldn’t load recent uploads.</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No uploads yet.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <article
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-secondary/20 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                      `bg-store-${r.store}/10`,
                    )}
                    aria-hidden="true"
                  >
                    <FileText className={cn("h-5 w-5", `text-store-${r.store}`)} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">{r.file_name}</p>
                      <StatusBadge status={r.uiStatus} />
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={r.store} className="text-[11px]">
                        {STORE_INFO[r.store].name}
                      </Badge>
                      <span aria-hidden="true">•</span>
                      <time dateTime={r.created_at}>{r.createdAt.toLocaleString()}</time>
                      {typeof r.products_found === "number" && r.products_found > 0 && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>{r.products_found} products</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0" aria-label={`Status: ${r.uiStatus}`}>
                  <StatusIcon status={r.uiStatus} />
                </div>
              </article>
            ))}
          </div>
        )}

        {!user && (
          <p className="mt-4 text-xs text-muted-foreground">
            Tip: log in as an admin to upload brochures.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
