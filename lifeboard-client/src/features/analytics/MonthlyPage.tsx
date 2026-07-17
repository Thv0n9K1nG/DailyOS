import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CheckSquare, Clock, Heart } from "lucide-react";
import { useMonthlyAnalytics } from "./hooks/useAnalytics";

const MONTHS_VI = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const WEEKDAYS = ["T2","T3","T4","T5","T6","T7","CN"];

const getIntensityColor = (day: { completedTasks: number; focusMinutes: number; habitsCompleted: number } | null) => {
  if (!day) return "transparent";
  const score = day.completedTasks + Math.floor(day.focusMinutes / 30) + day.habitsCompleted;
  if (score === 0) return "var(--bg-overlay)";
  if (score <= 2) return "rgba(61,142,240,0.25)";
  if (score <= 5) return "rgba(61,142,240,0.5)";
  if (score <= 8) return "rgba(61,142,240,0.75)";
  return "var(--accent-primary)";
};

const formatHours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? m + 'm' : ''}` : `${m}m`;
};

export const MonthlyPage: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [hovered, setHovered] = useState<string | null>(null);

  const { data, isLoading } = useMonthlyAnalytics(year, month);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1);
  // Monday = 0 offset
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(year, month, 0).getDate();

  const dayMap = new Map(data?.days.map(d => [d.date, d]) ?? []);
  const cells: (string | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }),
  ];
  // Pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const hoveredDay = hovered ? dayMap.get(hovered) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Header */}
      <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[--text-primary] mb-2">Phân tích tháng</h2>
            <p className="text-sm text-[--text-secondary]">Heatmap hoạt động hàng ngày trong tháng.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={prevMonth} style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "6px 10px", cursor: "pointer", color: "var(--text-primary)" }}>
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-[--text-primary]" style={{ minWidth: "140px", textAlign: "center" }}>
              {MONTHS_VI[month - 1]} {year}
            </span>
            <button onClick={nextMonth} style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "6px 10px", cursor: "pointer", color: "var(--text-primary)" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-10 text-[--text-muted]">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Summary Cards */}
          {data && (
            <div className="grid grid-cols-3" style={{ gap: "var(--space-4)" }}>
              {[
                { label: "Tasks hoàn thành", value: data.summary.totalCompletedTasks, icon: <CheckSquare size={18} />, color: "var(--color-success)" },
                { label: "Giờ tập trung", value: formatHours(Math.round(data.summary.totalFocusHours * 60)), icon: <Clock size={18} />, color: "var(--color-warning)" },
                { label: "Tỉ lệ hoàn thành", value: `${Math.round(data.summary.completionRate * 100)}%`, icon: <Heart size={18} />, color: "var(--accent-primary)" },
              ].map((s, i) => (
                <div key={i} className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle]"
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ padding: "10px", borderRadius: "var(--radius-md)", background: "var(--bg-overlay)", color: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calendar Heatmap */}
          <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle]">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-semibold text-[--text-primary] text-sm">Heatmap hoạt động</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                <span>Ít</span>
                {["var(--bg-overlay)", "rgba(61,142,240,0.25)", "rgba(61,142,240,0.5)", "rgba(61,142,240,0.75)", "var(--accent-primary)"].map((c, i) => (
                  <div key={i} style={{ width: "14px", height: "14px", borderRadius: "3px", background: c, border: "1px solid var(--border-subtle)" }} />
                ))}
                <span>Nhiều</span>
              </div>
            </div>

            {/* Weekday headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
              {WEEKDAYS.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600, padding: "4px" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {cells.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} />;
                }
                const dayData = dayMap.get(dateStr);
                const dayNum = parseInt(dateStr.split('-')[2]);
                const isToday = dateStr === now.toISOString().split('T')[0];
                const isHov = hovered === dateStr;
                return (
                  <div key={dateStr}
                    onMouseEnter={() => setHovered(dateStr)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "var(--radius-sm)",
                      background: getIntensityColor(dayData || null),
                      border: isToday ? "2px solid var(--accent-primary)" : isHov ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 150ms ease",
                      transform: isHov ? "scale(1.15)" : "scale(1)",
                    }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: isToday ? 700 : 400 }}>
                      {dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tooltip */}
            {hovered && (
              <div style={{ marginTop: "16px", padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {new Date(hovered + "T00:00:00").toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                {hoveredDay ? (
                  <div style={{ display: "flex", gap: "16px" }}>
                    <span style={{ color: "var(--color-success)" }}>✅ {hoveredDay.completedTasks} tasks</span>
                    <span style={{ color: "var(--color-warning)" }}>⏱ {hoveredDay.focusMinutes}m focus</span>
                    <span style={{ color: "var(--accent-primary)" }}>🎯 {hoveredDay.habitsCompleted} habits</span>
                  </div>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>Không có hoạt động</span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

