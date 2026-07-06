import { CATEGORIES } from "@/data/categories";

export function CategoryChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip active={!value} onClick={() => onChange(null)}>
        All
      </Chip>
      {CATEGORIES.map((c) => (
        <Chip
          key={c.id}
          active={value === c.slug}
          onClick={() => onChange(value === c.slug ? null : c.slug)}
        >
          {c.name}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-brand bg-brand text-white shadow-brand"
          : "border-border bg-card text-foreground hover:border-brand/40 hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}
