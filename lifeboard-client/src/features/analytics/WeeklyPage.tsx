import React from "react";
import { format, subDays, parseISO, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { useTasks } from "../tasks/hooks/useTasks";
import { useFocusSessions } from "../focus/hooks/useFocus";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { formatDuration } from "@/lib/utils";
import { ListTodo, CheckSquare, Clock } from "lucide-react";

export const WeeklyPage: React.FC = () => {
  const today = new Date();
  const startRange = subDays(today, 6); // Last 7 days including today
  
  const fromStr = startRange.toISOString().split('T')[0];
  const toStr = today.toISOString().split('T')[0];

  const { data: tasksData, isLoading: isLoadingTasks } = useTasks({});
  const { data: focusData, isLoading: isLoadingFocus } = useFocusSessions(fromStr, toStr);

  const tasks = tasksData?.data || [];
  const focusSessions = focusData?.data || [];

  // Generate date array for last 7 days
  const dateList = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(today, 6 - i);
    return d.toISOString().split('T')[0];
  });

  // 1. Process Tasks Chart Data
  const tasksChartData = dateList.map(dStr => {
    const dayTasks = tasks.filter(t => t.plannedDate && t.plannedDate.split('T')[0] === dStr);
    const completed = dayTasks.filter(t => t.status === 'done').length;
    const pending = dayTasks.filter(t => t.status !== 'done').length;
    
    // Label as "Thứ X" or date
    const dObj = new Date(dStr + "T00:00:00");
    const dayLabel = format(dObj, "eee", { locale: vi });

    return {
      name: dayLabel,
      "Hoàn thành": completed,
      "Chưa xong": pending,
    };
  });

  // 2. Process Focus Chart Data
  const focusChartData = dateList.map(dStr => {
    const daySessions = focusSessions.filter(s => s.sessionDate.split('T')[0] === dStr);
    const totalMinutes = Math.round(daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);

    const dObj = new Date(dStr + "T00:00:00");
    const dayLabel = format(dObj, "eee", { locale: vi });

    return {
      name: dayLabel,
      "Tập trung (phút)": totalMinutes,
    };
  });

  // 3. Stats Calculation
  const weekTasks = tasks.filter(t => t.plannedDate && t.plannedDate.split('T')[0] >= fromStr && t.plannedDate.split('T')[0] <= toStr);
  const weekCompleted = weekTasks.filter(t => t.status === 'done').length;
  const totalFocusSeconds = focusSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  const stats = [
    { label: "Tasks tuần này", value: weekTasks.length, icon: <ListTodo size={20} />, color: "var(--accent-primary)" },
    { label: "Đã hoàn thành", value: weekCompleted, icon: <CheckSquare size={20} />, color: "var(--color-success)" },
    { label: "Thời gian tập trung", value: formatDuration(totalFocusSeconds), icon: <Clock size={20} />, color: "var(--color-warning)" },
  ];

  const isLoading = isLoadingTasks || isLoadingFocus;

  return (
    <div className="space-y-6">
      <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] mb-5">
        <h2 className="text-xl font-bold text-[--text-primary] mb-2">Báo cáo hiệu suất tuần</h2>
        <p className="text-sm text-[--text-secondary]">Phân tích hoạt động và thời lượng tập trung của bạn trong 7 ngày qua.</p>
      </div>

      {isLoading ? (
        <div className="text-center p-10 text-[--text-muted]">Đang phân tích dữ liệu...</div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle] flex items-center gap-4">
                <div className="p-3 rounded-md" style={{ background: "var(--bg-overlay)", color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-[--text-primary]">{s.value}</div>
                  <div className="text-xs text-[--text-muted]">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Tasks Completion */}
            <div className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle]">
              <h3 className="font-semibold text-[--text-primary] mb-4 text-sm">Hoàn thành nhiệm vụ</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tasksChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    <Bar dataKey="Hoàn thành" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Chưa xong" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Focus Time */}
            <div className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle]">
              <h3 className="font-semibold text-[--text-primary] mb-4 text-sm">Thời lượng tập trung (Phút)</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={focusChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    <Line type="monotone" dataKey="Tập trung (phút)" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
