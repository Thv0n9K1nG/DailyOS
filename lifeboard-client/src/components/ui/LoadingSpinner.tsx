import React from "react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 32, className }) => (
  <div
    className={className}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-8)",
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={{ animation: "spin 0.9s linear infinite" }}
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        stroke="var(--border-default)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M16 4 A12 12 0 0 1 28 16"
        stroke="var(--accent-primary)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  </div>
);
