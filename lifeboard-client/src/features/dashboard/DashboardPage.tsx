import React from "react";

// TODO: Implement DashboardPage
// Tổng quan hôm nay — tasks, countdown, focus timer

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <div style={{
        padding: "var(--space-6)", background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)",
        marginBottom: "var(--space-5)",
      }}>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
          Dashboard
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
          Tổng quan hôm nay — tasks, countdown, focus timer
        </p>
      </div>
      <div style={{
        padding: "var(--space-10)", textAlign: "center",
        color: "var(--text-muted)", fontSize: "var(--text-sm)",
        border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-lg)",
      }}>
        🚧 Đang phát triển — DashboardPage
      </div>
    </div>
  );
};
