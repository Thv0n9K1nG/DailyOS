import React from "react";
import { NavLink } from "react-router-dom";
import logoUrl from "@/assets/logo.png";
import {
  LayoutDashboard, Calendar, CheckSquare, Sunrise, Repeat, Target,
  Timer, Clock, FileText, Smile, BarChart2, TrendingUp, Search,
  AlarmClock, Settings,
} from "lucide-react";

const navItems = [
  { path: "/",                  icon: LayoutDashboard, label: "Dashboard" },
  { path: "/calendar",          icon: Calendar,        label: "Lịch" },
  { path: "/tasks",             icon: CheckSquare,     label: "Nhiệm vụ" },
  { path: "/tomorrow",          icon: Sunrise,         label: "Ngày mai" },
  { path: "/habits",            icon: Repeat,          label: "Thói quen" },
  { path: "/goals",             icon: Target,          label: "Mục tiêu" },
  { path: "/focus/stopwatch",   icon: Timer,           label: "Stopwatch" },
  { path: "/focus/pomodoro",    icon: Clock,           label: "Pomodoro" },
  { path: "/notes",             icon: FileText,        label: "Ghi chú" },
  { path: "/mood",              icon: Smile,           label: "Tâm trạng" },
  { path: "/analytics/weekly",  icon: BarChart2,       label: "Phân tích" },
  { path: "/statistics",        icon: TrendingUp,      label: "Thống kê" },
  { path: "/search",            icon: Search,          label: "Tìm kiếm" },
  { path: "/countdown",         icon: AlarmClock,      label: "Đếm ngược" },
  { path: "/settings",          icon: Settings,        label: "Cài đặt" },
];

export const Sidebar: React.FC = () => (
  <aside style={{
    width: "var(--sidebar-width)", height: "100vh", position: "fixed", left: 0, top: 0,
    background: "var(--bg-surface)", borderRight: "1px solid var(--border-subtle)",
    display: "flex", flexDirection: "column", padding: "var(--space-4) var(--space-3)",
    zIndex: 50, overflowY: "auto",
  }}>
    {/* Logo */}
    <div style={{ padding: "var(--space-3) var(--space-3) var(--space-6)", display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src={logoUrl}
        alt="LifeBoard logo"
        style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", objectFit: "cover" }}
      />
      <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-primary)" }}>LifeBoard</span>
    </div>

    {/* Nav */}
    <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
      {navItems.map(({ path, icon: Icon, label }) => (
        <NavLink key={path} to={path} end={path === "/"} style={({ isActive }) => ({
          display: "flex", alignItems: "center", gap: "var(--space-3)",
          padding: "0 var(--space-3)", height: 40, borderRadius: "var(--radius-md)",
          textDecoration: "none", fontSize: "var(--text-sm)", fontWeight: 500,
          color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
          background: isActive ? "var(--accent-subtle)" : "transparent",
        })}>
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  </aside>
);
