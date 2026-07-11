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
  primary:   "bg-[--accent-primary] text-white hover:bg-[--accent-hover]",
  secondary: "bg-[--bg-elevated] text-[--text-primary] border border-[--border-default] hover:border-[--border-strong]",
  ghost:     "bg-transparent text-[--text-secondary] hover:bg-[--bg-overlay] hover:text-[--text-primary]",
  danger:    "bg-[--color-danger] text-white hover:opacity-90",
};
const sizeStyles: Record<Size, string> = {
  sm: "h-7 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, leftIcon, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classNames(
        "inline-flex items-center justify-center font-medium rounded-[--radius-md] transition-all",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={{ borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)" }}
      {...props}
    >
      {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : leftIcon}
      {children}
    </button>
  )
);
Button.displayName = "Button";
