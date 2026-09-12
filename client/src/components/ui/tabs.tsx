import { cn } from "@/lib/utils";

export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-surface-1 p-1 border border-surface-border">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === item.value
              ? "bg-surface-3 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
