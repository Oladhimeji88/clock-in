import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "icon";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-linear-to-b from-accent-400 to-accent-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_8px_20px_-8px_var(--accent-500)] hover:brightness-110 active:brightness-95",
  secondary: "bg-surface-3 text-slate-100 border border-surface-border hover:bg-[#242c3d]",
  outline: "bg-transparent border border-surface-border text-slate-200 hover:bg-surface-2",
  ghost: "bg-transparent text-slate-300 hover:bg-surface-2 hover:text-white",
  danger: "bg-danger-500 text-white hover:brightness-110 shadow-[0_8px_20px_-8px_rgba(239,68,68,0.6)]",
  success: "bg-success-500 text-white hover:brightness-110 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.6)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 focus-visible:ring-accent-500",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
