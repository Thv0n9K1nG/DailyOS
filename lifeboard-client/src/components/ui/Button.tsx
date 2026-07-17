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
  primary:   "btn-primary",
  secondary: "btn-secondary",
  ghost:     "btn-ghost",
  danger:    "btn-danger",
};
const sizeStyles: Record<Size, string> = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, leftIcon, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classNames(
        "btn",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={{ fontFamily: "var(--font-sans)" }}
      {...props}
    >
      {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : leftIcon}
      {children}
    </button>
  )
);
Button.displayName = "Button";
