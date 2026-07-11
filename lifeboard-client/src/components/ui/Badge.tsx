import React from "react";
import type { Priority } from "@/types";

interface BadgeProps { label: string; color?: string; }
export const Badge: React.FC<BadgeProps> = ({ label, color = "var(--accent-primary)" }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: "2px 8px",
    borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 500,
    background: color + "25", color,
  }}>{label}</span>
);

interface PriorityBadgeProps { priority: Priority; }
const priorityMap: Record<Priority, { label: string; color: string }> = {
  high:   { label: "Cao",   color: "var(--priority-high)" },
  medium: { label: "Vừa",  color: "var(--priority-medium)" },
  low:    { label: "Thấp", color: "var(--priority-low)" },
};
export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const { label, color } = priorityMap[priority];
  return <Badge label={label} color={color} />;
};
