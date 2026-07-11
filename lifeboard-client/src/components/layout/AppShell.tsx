import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const pageTitles: Record<string, string> = {
  "/":                  "Dashboard",
  "/calendar":          "Lịch",
  "/tasks":             "Nhiệm vụ",
  "/tomorrow":          "Kế hoạch ngày mai",
  "/habits":            "Thói quen",
  "/goals":             "Mục tiêu",
  "/focus/stopwatch":   "Stopwatch",
  "/focus/pomodoro":    "Pomodoro",
  "/notes":             "Ghi chú ngày",
  "/mood":              "Tâm trạng",
  "/analytics/weekly":  "Phân tích tuần",
  "/analytics/monthly": "Phân tích tháng",
  "/analytics/yearly":  "Heatmap năm",
  "/statistics":        "Thống kê",
  "/search":            "Tìm kiếm",
  "/countdown":         "Đếm ngược",
  "/settings":          "Cài đặt",
};

export const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  // Dynamic: /calendar/:date
  const base = pathname.startsWith("/calendar/") ? "/calendar" : pathname;
  const title = pageTitles[base] ?? "LifeBoard";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ marginLeft: "var(--sidebar-width)", flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={title} />
        <main style={{
          marginTop: "var(--header-height)", flex: 1,
          padding: "var(--space-6)", animation: "fadeIn 200ms ease",
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
