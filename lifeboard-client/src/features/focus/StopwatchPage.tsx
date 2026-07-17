import React from "react";
import { FocusPage } from "./FocusPage";

export const StopwatchPage: React.FC = () => {
  return (
    <div>
      <div style={{
        padding: "var(--space-6)", background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)",
        marginBottom: "var(--space-5)",
      }}>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-2)", margin: "0 0 var(--space-2)" }}>
          Stopwatch
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: 0 }}>
          Theo dõi thời gian tập trung làm việc tự do
        </p>
      </div>
      <FocusPage defaultMode="stopwatch" />
    </div>
  );
};
