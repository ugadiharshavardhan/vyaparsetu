export function SpecificationTable({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs);
  return (
    <dl className="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      {entries.map(([k, v], i) => (
        <div
          key={k}
          className={`flex items-center justify-between p-4 text-sm ${
            i >= 2 && entries.length > 2 ? "sm:border-t sm:border-border" : ""
          }`}
        >
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-right font-medium text-foreground">{String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}
