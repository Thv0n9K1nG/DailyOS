import React from "react";
import { FocusPage } from "./FocusPage";

export const PomodoroPage: React.FC = () => {
  return (
    <div>
      <div style={{
        padding: "var(--space-6)", background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)",
        marginBottom: "var(--space-5)",
      }}>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-2)", margin: "0 0 var(--space-2)" }}>
          Pomodoro
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: 0 }}>
          Tập trung theo chu kỳ (25 phút làm việc, 5 phút nghỉ ngơi)
        </p>
      </div>
      <FocusPage defaultMode="pomodoro" />
    </div>
  );
};
