import React from "react";
import { NavLink } from "react-router-dom";
import faviconUrl from "/favicon.svg";
import {
  LayoutDashboard, Calendar, CheckSquare, Sunrise, Repeat, Target,
  Timer, Clock, FileText, Smile, BarChart2, TrendingUp, Search,
  AlarmClock, Settings,
} from "lucide-react";

const navGroups = [
  {
    label: "Tổng quan",
    items: [
      { path: "/",         icon: LayoutDashboard, label: "Dashboard" },
      { path: "/calendar", icon: Calendar,        label: "Lịch" },
    ],
  },
  {
    label: "Công việc",
    items: [
      { path: "/tasks",    icon: CheckSquare, label: "Nhiệm vụ" },
      { path: "/tomorrow", icon: Sunrise,     label: "Ngày mai" },
    ],
  },
  {
    label: "Nâng cao",
    items: [
      { path: "/habits",          icon: Repeat,   label: "Thói quen" },
      { path: "/goals",           icon: Target,   label: "Mục tiêu" },
      { path: "/focus/stopwatch", icon: Timer,    label: "Stopwatch" },
      { path: "/focus/pomodoro",  icon: Clock,    label: "Pomodoro" },
      { path: "/notes",           icon: FileText, label: "Ghi chú" },
      { path: "/mood",            icon: Smile,    label: "Tâm trạng" },
    ],
  },
  {
    label: "Phân tích",
    items: [
      { path: "/analytics/weekly", icon: BarChart2,  label: "Phân tích" },
      { path: "/statistics",       icon: TrendingUp, label: "Thống kê" },
    ],
  },
  {
    label: "Khác",
    items: [
      { path: "/search",    icon: Search,     label: "Tìm kiếm" },
      { path: "/countdown", icon: AlarmClock, label: "Đếm ngược" },
      { path: "/settings",  icon: Settings,   label: "Cài đặt" },
    ],
  },
];

export const Sidebar: React.FC = () => {
  let itemIndex = 0;

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "var(--space-5) var(--space-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
          animation: "slideInLeft 250ms ease both",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--accent-primary), var(--color-info))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px var(--accent-glow)",
          }}
        >
          <img src={faviconUrl} alt="LifeBoard" style={{ width: 22, height: 22 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-primary)" }}>
            LifeBoard
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Plan · Focus · Achieve
          </span>
        </div>
      </div>

      {/* Nav Groups */}
      <nav
        style={{
          flex: 1,
          padding: "var(--space-2) var(--space-3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: "var(--space-1)" }}>
            {/* Group label */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "var(--space-3) var(--space-3) var(--space-1)",
              }}
            >
              {group.label}
            </div>

            {/* Items */}
            {group.items.map(({ path, icon: Icon, label }) => {
              const delay = itemIndex++ * 35;
              return (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/"}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "0 var(--space-3)",
                    height: 38,
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    fontSize: "var(--text-sm)",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                    background: isActive ? "var(--accent-subtle)" : "transparent",
                    borderLeft: isActive
                      ? "2px solid var(--accent-primary)"
                      : "2px solid transparent",
                    transition: "all 150ms ease",
                    animation: `slideInLeft 300ms ${delay}ms ease both`,
                  })}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "var(--space-4)",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: 10,
          color: "var(--text-muted)",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        Stage 1 · v0.1.0
      </div>
    </aside>
  );
};
