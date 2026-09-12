import { type InputHTMLAttributes, type LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-surface-border bg-surface-1 px-3.5 text-sm text-slate-100 placeholder:text-slate-500",
        "outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-medium text-slate-300 mb-1.5 block", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger-400">{error}</p>}
    </div>
  );
}
