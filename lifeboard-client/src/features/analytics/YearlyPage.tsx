import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useYearlyAnalytics } from "./hooks/useAnalytics";
import { HeatmapDay } from "./api/analyticsApi";

const INTENSITY_COLORS = [
  "var(--bg-overlay)",        // 0 — no activity
  "rgba(61,142,240,0.2)",     // 1
  "rgba(61,142,240,0.45)",    // 2
  "rgba(61,142,240,0.7)",     // 3
  "var(--accent-primary)",    // 4
];

const MONTHS_SHORT = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];
const DAYS_LABEL = ["T2","","T4","","T6","","CN"];

export const YearlyPage: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [hovered, setHovered] = useState<string | null>(null);

  const { data, isLoading } = useYearlyAnalytics(year);

  // Build 53-week grid (Mon → Sun) starting from first Monday before Jan 1
  const { weeks, monthLabels } = useMemo(() => {
    const jan1 = new Date(year, 0, 1);
    // Start on Mon before or on Jan 1
    const startOffset = (jan1.getDay() + 6) % 7; // Mon=0
    const startDate = new Date(jan1);
    startDate.setDate(startDate.getDate() - startOffset);

    const heatmapMap = new Map(data?.heatmap.map(h => [h.date, h]) ?? []);

    const weeks: Array<Array<{ date: string; level: number; data?: HeatmapDay } | null>> = [];
    const monthLabels: { col: number; label: string }[] = [];
    let col = 0;
    let seenMonths = new Set<number>();

    const cur = new Date(startDate);
    while (cur.getFullYear() <= year || (cur.getFullYear() === year + 1 && col < 53)) {
      const week: typeof weeks[0] = [];
      for (let day = 0; day < 7; day++) {
        const dateStr = cur.toISOString().split('T')[0];
        const curYear = cur.getFullYear();
        if (curYear === year) {
          const mon = cur.getMonth();
          if (!seenMonths.has(mon)) {
            seenMonths.add(mon);
            monthLabels.push({ col, label: MONTHS_SHORT[mon] });
          }
          const entry = heatmapMap.get(dateStr);
          week.push({ date: dateStr, level: entry?.intensityLevel ?? 0, data: entry });
        } else {
          week.push(null);
        }
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
      col++;
      if (col >= 53) break;
    }

    return { weeks, monthLabels };
  }, [year, data]);

  const hoveredEntry = hovered ? data?.heatmap.find(h => h.date === hovered) : null;
  const totalTasks = data?.heatmap.reduce((s, h) => s + h.taskCount, 0) ?? 0;
  const totalFocus = data?.heatmap.reduce((s, h) => s + h.focusMinutes, 0) ?? 0;
  const totalHabits = data?.heatmap.reduce((s, h) => s + h.habitDone, 0) ?? 0;
  const activeDays = data?.heatmap.filter(h => h.intensityLevel > 0).length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Header */}
      <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[--text-primary] mb-2">Heatmap năm</h2>
            <p className="text-sm text-[--text-secondary]">GitHub-style heatmap theo dõi hoạt động 365 ngày.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setYear(y => y - 1)}
              style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "6px 10px", cursor: "pointer", color: "var(--text-primary)" }}>
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-[--text-primary]" style={{ minWidth: "60px", textAlign: "center" }}>
              {year}
            </span>
            <button onClick={() => setYear(y => y + 1)}
              style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "6px 10px", cursor: "pointer", color: "var(--text-primary)" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-10 text-[--text-muted]">Đang tải heatmap...</div>
      ) : (
        <>
          {/* Year Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
            {[
              { label: "Ngày hoạt động", value: activeDays, emoji: "🔥" },
              { label: "Tasks hoàn thành", value: totalTasks, emoji: "✅" },
              { label: "Phút tập trung", value: `${Math.round(totalFocus / 60)}h`, emoji: "⏱" },
              { label: "Habit check-ins", value: totalHabits, emoji: "🎯" },
            ].map((s, i) => (
              <div key={i} className="bg-[--bg-surface] p-4 rounded-[--radius-lg] border border-[--border-subtle]" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.emoji}</div>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* GitHub Heatmap */}
          <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle]">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-semibold text-[--text-primary] text-sm">Lịch hoạt động</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                <span>Ít</span>
                {INTENSITY_COLORS.map((c, i) => (
                  <div key={i} style={{ width: "12px", height: "12px", borderRadius: "3px", background: c, border: "1px solid var(--border-subtle)" }} />
                ))}
                <span>Nhiều</span>
              </div>
            </div>

            <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
              <div style={{ display: "flex", gap: "2px", minWidth: "max-content" }}>
                {/* Day-of-week labels column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginRight: "4px", marginTop: "20px" }}>
                  {DAYS_LABEL.map((d, i) => (
                    <div key={i} style={{ height: "12px", fontSize: "10px", color: "var(--text-muted)", lineHeight: "12px", width: "18px" }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Weeks */}
                <div style={{ position: "relative" }}>
                  {/* Month labels */}
                  <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: "18px" }}>
                    {monthLabels.map(({ col, label }) => (
                      <div key={label} style={{
                        position: "absolute",
                        left: col * 14,
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}>{label}</div>
                    ))}
                  </div>

                  {/* Grid */}
                  <div style={{ display: "flex", gap: "2px", marginTop: "20px" }}>
                    {weeks.map((week, wi) => (
                      <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {week.map((cell, di) => {
                          if (!cell) return <div key={di} style={{ width: "12px", height: "12px" }} />;
                          const isHov = hovered === cell.date;
                          return (
                            <div key={cell.date}
                              onMouseEnter={() => setHovered(cell.date)}
                              onMouseLeave={() => setHovered(null)}
                              style={{
                                width: "12px", height: "12px",
                                borderRadius: "2px",
                                background: INTENSITY_COLORS[cell.level] || INTENSITY_COLORS[0],
                                cursor: "pointer",
                                border: isHov ? "1px solid var(--accent-primary)" : "1px solid transparent",
                                transition: "transform 100ms ease",
                                transform: isHov ? "scale(1.4)" : "scale(1)",
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltip */}
            {hovered && (
              <div style={{ marginTop: "12px", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: "var(--text-xs)", display: "inline-block" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", marginRight: "12px" }}>
                  {new Date(hovered + "T00:00:00").toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {hoveredEntry ? (
                  <span style={{ color: "var(--text-secondary)" }}>
                    ✅ {hoveredEntry.taskCount} tasks · ⏱ {hoveredEntry.focusMinutes}m · 🎯 {hoveredEntry.habitDone} habits
                  </span>
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

