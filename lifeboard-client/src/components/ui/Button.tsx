import React from "react";
import { Loader2 } from "lucide-react";
import { classNames } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   "bg-[--accent-primary] text-white shadow-[0_4px_12px_var(--accent-glow)] hover:shadow-[0_6px_20px_var(--accent-glow)] hover:bg-[--accent-hover] hover:-translate-y-0.5",
  secondary: "bg-[--bg-surface] text-[--text-primary] border border-[--border-default] hover:border-[--accent-primary] hover:text-[--accent-primary] hover:-translate-y-0.5 shadow-sm",
  ghost:     "bg-transparent text-[--text-secondary] hover:bg-[--bg-overlay] hover:text-[--text-primary]",
  danger:    "bg-[--color-danger] text-white shadow-[0_4px_12px_rgba(248,113,113,0.3)] hover:shadow-[0_6px_20px_rgba(248,113,113,0.4)] hover:-translate-y-0.5 hover:opacity-90",
};
const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-4 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, leftIcon, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classNames(
        "inline-flex items-center justify-center font-semibold rounded-[8px] transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
        "active:scale-[0.97]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.2px" }}
      {...props}
    >
      {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : leftIcon}
      {children}
    </button>
  )
);
Button.displayName = "Button";
