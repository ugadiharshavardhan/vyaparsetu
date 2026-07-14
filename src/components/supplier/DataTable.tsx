import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  bulkActions,
  pageSize = 10,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (ids: string[]) => void;
  bulkActions?: ReactNode;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  
  // Reset page if data length changes drastically
  if (page > totalPages) setPage(totalPages);

  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const allSelected = paginatedRows.length > 0 && paginatedRows.every(r => selectedIds.includes(r.id));
  const someSelected = paginatedRows.some(r => selectedIds.includes(r.id)) && !allSelected;

  const toggleAll = () => {
    if (!onSelectChange) return;
    if (allSelected) {
      onSelectChange(selectedIds.filter(id => !paginatedRows.some(r => r.id === id)));
    } else {
      const newIds = [...selectedIds];
      paginatedRows.forEach(r => {
        if (!newIds.includes(r.id)) newIds.push(r.id);
      });
      onSelectChange(newIds);
    }
  };

  const toggleOne = (id: string) => {
    if (!onSelectChange) return;
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(x => x !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  if (rows.length === 0 && empty) {
    return <div className="rounded-2xl border border-dashed border-border p-10 text-center">{empty}</div>;
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && bulkActions && (
        <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 p-2 pl-4">
          <span className="text-sm font-medium text-brand">{selectedIds.length} selected</span>
          <div className="h-4 w-px bg-border"></div>
          {bulkActions}
        </div>
      )}
      
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${c.className ?? ""}`}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, i) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    onClick={() => {
                      if (selectable && onSelectChange) {
                        toggleOne(row.id);
                      } else {
                        onRowClick?.(row);
                      }
                    }}
                    className={`border-b border-border/60 transition-colors last:border-0 ${
                      isSelected ? "bg-muted/50" : "hover:bg-muted/30"
                    } ${onRowClick || selectable ? "cursor-pointer" : ""}`}
                  >
                    {selectable && (
                      <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(row.id)}
                          aria-label={`Select row`}
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td 
                        key={c.key} 
                        className={`px-4 py-3 align-middle ${c.className ?? ""}`}
                        onClick={(e) => {
                          if (selectable && onRowClick) {
                            e.stopPropagation();
                            onRowClick(row);
                          }
                        }}
                      >
                        {c.cell(row)}
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * pageSize, rows.length)}</span> of <span className="font-medium text-foreground">{rows.length}</span> results
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <div key={p} className="flex items-center">
                  {i > 0 && p - arr[i - 1] > 1 && <span className="px-2 text-muted-foreground">...</span>}
                  <Button
                    variant={page === p ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className="h-8 w-8 p-0"
                  >
                    {p}
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
