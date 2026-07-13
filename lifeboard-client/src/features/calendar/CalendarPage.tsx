import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../tasks/hooks/useTasks";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];
const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun,1=Mon,...6=Sat → shift so Mon=0
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7; // Mon=0, Sun=6
}

function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const prevMonth = () => setCurrent(c => {
    const m = c.month === 0 ? 11 : c.month - 1;
    const y = c.month === 0 ? c.year - 1 : c.year;
    return { year: y, month: m };
  });

  const nextMonth = () => setCurrent(c => {
    const m = c.month === 11 ? 0 : c.month + 1;
    const y = c.month === 11 ? c.year + 1 : c.year;
    return { year: y, month: m };
  });

  const goToToday = () => setCurrent({ year: today.getFullYear(), month: today.getMonth() });

  // Fetch tasks for the current month (broad range)
  const firstDay = formatDateStr(current.year, current.month, 1);
  const lastDay = formatDateStr(current.year, current.month, getDaysInMonth(current.year, current.month));
  const { data } = useTasks({ pageSize: 200 });
  const tasks = data?.data || [];

  // Build a map: dateStr → {total, done, highPriority}
  const taskMap: Record<string, { total: number; done: number; haHigh: boolean; hasMed: boolean }> = {};
  tasks.forEach(t => {
    const d = t.plannedDate?.split("T")[0];
    if (!d) return;
    if (!taskMap[d]) taskMap[d] = { total: 0, done: 0, haHigh: false, hasMed: false };
    taskMap[d].total++;
    if (t.status === "done") taskMap[d].done++;
    if (t.priority === "high") taskMap[d].haHigh = true;
    if (t.priority === "medium") taskMap[d].hasMed = true;
  });

  const daysInMonth = getDaysInMonth(current.year, current.month);
  const startOffset = getFirstDayOfMonth(current.year, current.month);
  // Previous month's trailing days
  const prevMonthDays = getDaysInMonth(
    current.month === 0 ? current.year - 1 : current.year,
    current.month === 0 ? 11 : current.month - 1,
  );

  const cells: Array<{ day: number; currentMonth: boolean; dateStr: string }> = [];

  // Leading days from prev month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = current.month === 0 ? 11 : current.month - 1;
    const y = current.month === 0 ? current.year - 1 : current.year;
    cells.push({ day: d, currentMonth: false, dateStr: formatDateStr(y, m, d) });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, dateStr: formatDateStr(current.year, current.month, d) });
  }
  // Trailing days from next month
  const remaining = 42 - cells.length;
  const nextM = current.month === 11 ? 0 : current.month + 1;
  const nextY = current.month === 11 ? current.year + 1 : current.year;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, dateStr: formatDateStr(nextY, nextM, d) });
  }

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const dotColor = (dateStr: string) => {
    const info = taskMap[dateStr];
    if (!info) return null;
    if (info.haHigh) return "var(--priority-high)";
    if (info.hasMed) return "var(--priority-medium)";
    return "var(--priority-low)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Header card */}
      <div
        style={{
          padding: "var(--space-5) var(--space-6)",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-primary)",
            }}
          >
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {MONTH_NAMES[current.month]} {current.year}
            </h2>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0, marginTop: 2 }}>
              Click vào ngày để xem chi tiết
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <button
            onClick={goToToday}
            style={{
              padding: "0 var(--space-3)",
              height: 34,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "var(--text-sm)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Hôm nay
          </button>
          {[{ onClick: prevMonth, icon: <ChevronLeft size={18} /> }, { onClick: nextMonth, icon: <ChevronRight size={18} /> }].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 150ms ease",
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden",
        }}
      >
        {/* Day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              style={{
                padding: "var(--space-3) 0",
                textAlign: "center",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: i === 6 ? "var(--color-danger)" : "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
          }}
        >
          {cells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr && cell.currentMonth;
            const info = taskMap[cell.dateStr];
            const dot = dotColor(cell.dateStr);
            const isWeekend = idx % 7 === 6; // Sunday column

            return (
              <div
                key={`${cell.dateStr}-${idx}`}
                onClick={() => cell.currentMonth && navigate(`/calendar/${cell.dateStr}`)}
                style={{
                  minHeight: 80,
                  padding: "var(--space-2) var(--space-3)",
                  borderBottom: idx < 35 ? "1px solid var(--border-subtle)" : "none",
                  borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--border-subtle)" : "none",
                  cursor: cell.currentMonth ? "pointer" : "default",
                  transition: "background 150ms ease",
                  background: isToday
                    ? "var(--accent-subtle)"
                    : "transparent",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-1)",
                }}
                onMouseEnter={(e) => {
                  if (cell.currentMonth && !isToday) {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (cell.currentMonth && !isToday) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }
                }}
              >
                {/* Day number */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      fontSize: "var(--text-sm)",
                      fontWeight: isToday ? 700 : cell.currentMonth ? 500 : 400,
                      color: isToday
                        ? "var(--accent-primary)"
                        : cell.currentMonth
                        ? isWeekend ? "var(--color-danger)" : "var(--text-primary)"
                        : "var(--text-muted)",
                      background: isToday ? "var(--accent-subtle)" : "transparent",
                      outline: isToday ? "2px solid var(--accent-primary)" : "none",
                    }}
                  >
                    {cell.day}
                  </span>

                  {/* Priority dot */}
                  {dot && cell.currentMonth && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: dot,
                        marginTop: 4,
                        boxShadow: `0 0 6px ${dot}88`,
                      }}
                    />
                  )}
                </div>

                {/* Task count */}
                {info && cell.currentMonth && (
                  <div
                    style={{
                      fontSize: 10,
                      color: info.done === info.total ? "var(--color-success)" : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <span style={{
                      display: "inline-block",
                      width: `${Math.round((info.done / info.total) * 100)}%`,
                      height: 2,
                      background: info.done === info.total ? "var(--color-success)" : "var(--accent-primary)",
                      borderRadius: 1,
                      maxWidth: 40,
                      minWidth: 4,
                      transition: "width 400ms ease",
                    }} />
                    <span>{info.done}/{info.total}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-5)",
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          padding: "0 var(--space-2)",
        }}
      >
        {[
          { color: "var(--priority-high)",   label: "Ưu tiên cao" },
          { color: "var(--priority-medium)", label: "Ưu tiên vừa" },
          { color: "var(--priority-low)",    label: "Ưu tiên thấp" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};
