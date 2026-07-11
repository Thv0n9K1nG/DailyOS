import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode; title: string; description?: string;
  action?: { label: string; onClick: () => void };
}
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-16) var(--space-8)", textAlign: "center" }}>
    <div style={{ opacity: 0.3, color: "var(--text-muted)" }}>{icon}</div>
    <p style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-secondary)" }}>{title}</p>
    {description && <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", maxWidth: 320 }}>{description}</p>}
    {action && <Button onClick={action.onClick} style={{ marginTop: "var(--space-2)" }}>{action.label}</Button>}
  </div>
);
