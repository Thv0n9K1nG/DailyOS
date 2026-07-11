import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; leftIcon?: React.ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, style, ...props }, ref) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      {label && <label style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)" }}>{label}</label>}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {leftIcon && <span style={{ position: "absolute", left: 12, color: "var(--text-muted)" }}>{leftIcon}</span>}
        <input
          ref={ref}
          style={{
            height: 40, width: "100%",
            padding: leftIcon ? "0 12px 0 36px" : "0 12px",
            background: "var(--bg-overlay)",
            border: `1px solid ${error ? "var(--color-danger)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)", fontSize: "var(--text-base)",
            outline: "none", ...style,
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>{error}</span>}
    </div>
  )
);
Input.displayName = "Input";
