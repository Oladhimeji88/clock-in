import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-xl border border-surface-border bg-surface-1 px-3.5 pr-9 text-sm text-slate-100",
          "outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  )
);
Select.displayName = "Select";
