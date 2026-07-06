import { type ReactNode, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdminColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface AdminTableProps<T> {
  rows: T[];
  columns: AdminColumn<T>[];
  searchable?: (row: T) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  toolbar?: ReactNode;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  getRowId?: (row: T) => string;
}

export function AdminTable<T>({
  rows, columns, searchable, searchPlaceholder = "Search…",
  pageSize = 10, toolbar, empty, onRowClick, selectable, onSelectionChange,
  getRowId,
}: AdminTableProps<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!q || !searchable) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) => searchable(r).toLowerCase().includes(needle));
  }, [q, rows, searchable]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };
  const toggleAll = () => {
    const ids = current.map((r) => getRowId!(r));
    const all = ids.every((id) => selected.has(id));
    const next = new Set(selected);
    ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        {searchable ? (
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        ) : <div />}
        <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              {selectable && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={current.length > 0 && current.every((r) => selected.has(getRowId!(r)))}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={cn("px-3 py-3 font-semibold", c.className)}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  {empty ?? "No records found"}
                </td>
              </tr>
            ) : current.map((row, i) => {
              const id = getRowId?.(row) ?? String(i);
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border/60 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/40",
                  )}
                >
                  {selectable && (
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                        checked={selected.has(id)}
                        onChange={() => toggle(id)}
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-3 py-3 align-middle", c.className)}>{c.render(row)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} record{filtered.length === 1 ? "" : "s"} • Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
