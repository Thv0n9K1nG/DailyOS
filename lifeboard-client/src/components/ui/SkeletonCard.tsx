import React from "react";

const shimmer: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.4s infinite ease-in-out",
  borderRadius: "var(--radius-sm)",
};

export const SkeletonLine: React.FC<{ width?: string; height?: number }> = ({
  width = "100%",
  height = 14,
}) => (
  <div style={{ ...shimmer, width, height }} />
);

export const SkeletonTaskCard: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "var(--space-4)",
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-subtle)",
    }}
  >
    {/* Checkbox placeholder */}
    <div style={{ ...shimmer, width: 20, height: 20, borderRadius: "50%", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <SkeletonLine width="65%" height={14} />
      <SkeletonLine width="40%" height={11} />
    </div>
    <div style={{ ...shimmer, width: 50, height: 20, borderRadius: "var(--radius-full)" }} />
  </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <>
    <style>{`
      @keyframes skeleton-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTaskCard key={i} />
      ))}
    </div>
  </>
);
