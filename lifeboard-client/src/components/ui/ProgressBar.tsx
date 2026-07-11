import React from "react";

interface ProgressBarProps { value: number; max?: number; color?: string; height?: number; }
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, max = 100, color = "var(--accent-primary)", height = 8,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress-track" style={{
      height, background: "var(--bg-overlay)", borderRadius: "var(--radius-full)", overflow: "hidden",
    }}>
      <div className="progress-fill" style={{
        height: "100%", width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, var(--accent-primary))`,
        borderRadius: "var(--radius-full)",
        transition: "width 600ms cubic-bezier(0.34,1.56,0.64,1)",
      }} />
    </div>
  );
};
