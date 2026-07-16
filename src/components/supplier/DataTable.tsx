import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  page: externalPage,
  onPageChange: externalOnPageChange,
  embedded = false,
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
  page?: number;
  onPageChange?: (page: number) => void;
  embedded?: boolean;
}) {
  const [internalPage, setInternalPage] = useState(1);
  const isControlledPage = externalPage !== undefined && externalOnPageChange !== undefined;
  const page = isControlledPage ? externalPage : internalPage;
  const setPage = (p: number | ((prev: number) => number)) => {
    const nextVal = typeof p === "function" ? p(page) : p;
    if (isControlledPage) {
      externalOnPageChange(nextVal);
    } else {
      setInternalPage(nextVal);
    }
  };

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  
  // Reset page if data length changes drastically
  if (page > totalPages) {
    if (isControlledPage) {
      externalOnPageChange(totalPages);
    } else {
      setInternalPage(totalPages);
    }
  }

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
    return (
      <div className={cn(
        "text-center transition-all duration-200",
        embedded 
          ? "py-8 px-4" 
          : "rounded-2xl border border-dashed border-border p-10 bg-card shadow-soft"
      )}>
        {empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && bulkActions && (
        <div className="flex items-center gap-3.5 rounded-full border border-brand/20 bg-brand-soft/30 px-4 py-2 shadow-soft transition-all duration-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">{selectedIds.length} selected</span>
          <div className="h-4 w-px bg-brand/20"></div>
          {bulkActions}
        </div>
      )}
      
      <div className={cn(
        "overflow-hidden bg-card transition-all duration-200",
        embedded
          ? "border-0 shadow-none rounded-none"
          : "rounded-2xl border border-border/50 shadow-soft"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/15 text-left">
                {selectable && (
                  <th className="w-12 pl-5 pr-2 py-3.5">
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
                    className={`px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 ${c.className ?? ""}`}
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
                    transition={{ delay: i * 0.01, duration: 0.15 }}
                    onClick={() => {
                      if (selectable && onSelectChange) {
                        toggleOne(row.id);
                      } else {
                        onRowClick?.(row);
                      }
                    }}
                    className={`border-b border-border/30 transition-colors duration-150 last:border-0 ${
                      isSelected ? "bg-brand-soft/20 text-brand" : "hover:bg-muted/20"
                    } ${onRowClick || selectable ? "cursor-pointer" : ""}`}
                  >
                    {selectable && (
                      <td className="pl-5 pr-2 py-4 align-middle" onClick={(e) => e.stopPropagation()}>
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
                        className={`px-5 py-4 align-middle ${c.className ?? ""}`}
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

        {/* Visually integrated table footer for results count and pagination */}
        {totalPages > 1 && (
          <div className={cn(
            "flex items-center justify-between border-t border-border/40 bg-muted/5 px-6 py-4 transition-all duration-200",
            embedded && "rounded-b-2xl"
          )}>
            <p className="text-xs text-muted-foreground/90">
              Showing <span className="font-semibold text-foreground">{(page - 1) * pageSize + 1}</span> to <span className="font-semibold text-foreground">{Math.min(page * pageSize, rows.length)}</span> of <span className="font-semibold text-foreground">{rows.length}</span> results
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-full border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center gap-1.5">
                    {i > 0 && p - arr[i - 1] > 1 && <span className="px-1 text-muted-foreground/60 text-xs">...</span>}
                    <Button
                      variant={page === p ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-8 w-8 rounded-full text-xs font-semibold transition-colors",
                        page === p
                          ? "bg-brand text-white shadow-sm"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
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
                className="h-8 w-8 rounded-full border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
