import React, { useState } from "react";
import {
  Plus, CheckCircle2, Circle, Trash2, Edit2, ChevronLeft, ChevronRight,
  Calendar, AlertCircle, Flame, AlignLeft, CheckSquare2,
  ListChecks, Clock4, FilterX, Clock, Zap, ShieldCheck, Tag as TagIcon,
  LayoutGrid, List, FileText, AlarmClock,
} from "lucide-react";

import {
  useTasks, useCreateTask, useUpdateTask,
  useDeleteTask, useCompleteTask, useUncompleteTask,
} from "./hooks/useTasks";
import { Task } from "./api/taskApi";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { TaskFormModal } from "./TaskFormModal";
import { getTodayInTz, getStoredTimezone, getDeadlineInfo } from "../../stores/timezoneStore";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
/**
 * Format a Date object to YYYY-MM-DD using the user's stored timezone.
 * Always uses Intl to be timezone-aware (not JS local methods which follow OS).
 */
function toDateStr(d: Date): string {
  const tz = getStoredTimezone();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(d);
  const y = parts.find(p => p.type === "year")?.value ?? "";
  const m = parts.find(p => p.type === "month")?.value ?? "";
  const dy = parts.find(p => p.type === "day")?.value ?? "";
  return `${y}-${m}-${dy}`;
}

/** Today's date string YYYY-MM-DD in user timezone */
function todayStr() { return getTodayInTz(); }

function parsePlannedDate(raw?: string): Date | null {
  if (!raw) return null;
  // raw is always YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss — strip time part
  const s = raw.split("T")[0];
  const [y, mo, d] = s.split("-").map(Number);
  // Build a midnight Date in user timezone via Intl offset trick
  // We interpret the date string as a local date (no UTC shift needed)
  const dt = new Date(y, mo - 1, d, 0, 0, 0, 0);
  return dt;
}

/**
 * Format date label for the navigator header.
 * FIXED: compare date *strings* (YYYY-MM-DD) instead of raw timestamps
 * to avoid Math.round(0.64) = 1 → 'Ngày mai' bug when time-of-day > noon.
 */
function fmtDateLabel(d: Date): string {
  const dStr = toDateStr(d);
  const tStr = todayStr();

  // Build yesterday / tomorrow strings
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow  = new Date(); tomorrow.setDate(tomorrow.getDate()  + 1);

  const tz  = getStoredTimezone();
  // Get display parts in user timezone
  const parts = new Intl.DateTimeFormat("vi-VN", {
    timeZone: tz, weekday: "short", day: "2-digit", month: "2-digit",
  }).formatToParts(d);
  const weekday = parts.find(p => p.type === "weekday")?.value ?? "";
  const dayNum  = parts.find(p => p.type === "day")?.value ?? "";
  const monNum  = parts.find(p => p.type === "month")?.value ?? "";
  const ddmm = `${dayNum}/${monNum}`;

  if (dStr === tStr)            return `Hôm nay — ${ddmm}`;
  if (dStr === toDateStr(yesterday)) return `Hôm qua — ${ddmm}`;
  if (dStr === toDateStr(tomorrow))  return `Ngày mai — ${ddmm}`;
  return `${weekday}, ${ddmm}`;
}

/** Format a UTC datetime string (from API) to HH:mm in the user's timezone */
function fmtCompletedAt(isoStr: string): string {
  const tz = getStoredTimezone();
  // Ensure the string is parsed as UTC: append Z if no timezone indicator present
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(isoStr) ? isoStr : isoStr + "Z";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: tz,
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).format(new Date(normalized));
}

const PRIORITY = {
  high:   { label: "Cao",  color: "var(--priority-high)",   bg: "rgba(248,113,113,0.14)", glow: "rgba(248,113,113,0.3)", icon: <Flame size={11} /> },
  medium: { label: "Vừa", color: "var(--priority-medium)", bg: "rgba(255,179,71,0.14)",  glow: "rgba(255,179,71,0.3)",  icon: <Zap size={11} /> },
  low:    { label: "Thấp", color: "var(--priority-low)",   bg: "rgba(82,215,191,0.14)",  glow: "rgba(82,215,191,0.3)",  icon: <ShieldCheck size={11} /> },
};

/* ── Inline CSS for animations ────────────────────────────────────────────── */
const styleTag = `
@keyframes taskSlideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes checkBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes ringFill {
  from { stroke-dashoffset: 138.2; }
}
.task-card-enter { animation: taskSlideIn 220ms ease both; }
.check-bounce    { animation: checkBounce 320ms cubic-bezier(0.34,1.56,0.64,1); }
.skeleton-shimmer {
  background: linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite;
}
`;

/* ── Progress Ring ────────────────────────────────────────────────────────── */
const ProgressRing = ({ done, total }: { done: number; total: number }) => {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const r = 22; const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const isComplete = pct === 100;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={56} height={56} viewBox="0 0 52 52">
          {/* Track */}
          <circle cx={26} cy={26} r={r} fill="none"
            stroke="var(--border-subtle)" strokeWidth={4} />
          {/* Fill */}
          <circle cx={26} cy={26} r={r} fill="none"
            stroke={isComplete ? "var(--color-success)" : "var(--accent-primary)"}
            strokeWidth={4}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
            style={{
              transition: "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1), stroke 0.3s ease",
              filter: pct > 0 ? `drop-shadow(0 0 4px ${isComplete ? "var(--color-success)" : "var(--accent-primary)"})` : "none",
            }}
          />
          <text x={26} y={30} textAnchor="middle" fontSize={11} fontWeight={800}
            fill={isComplete ? "var(--color-success)" : "var(--text-primary)"}>
            {pct}%
          </text>
        </svg>
        {isComplete && (
          <div style={{
            position: "absolute", top: -4, right: -4,
            width: 16, height: 16, borderRadius: "50%",
            background: "var(--color-success)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, border: "2px solid var(--bg-base)",
          }}>✓</div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
          {done}/{total} nhiệm vụ
        </div>
        <div style={{ fontSize: 11, color: isComplete ? "var(--color-success)" : "var(--text-muted)", marginTop: 2, fontWeight: isComplete ? 600 : 400 }}>
          {total === 0 ? "Chưa có việc gì" : isComplete ? "🎉 Hoàn thành tất cả!" : `Còn ${total - done} việc nữa`}
        </div>
      </div>
    </div>
  );
};

/* ── Quick Add ────────────────────────────────────────────────────────────── */
const QuickAdd = ({ onAdd }: { onAdd: (title: string) => void }) => {
  const [val, setVal] = useState("");
  const [focused, setFocused] = useState(false);

  const submit = () => {
    if (val.trim()) { onAdd(val.trim()); setVal(""); }
  };

  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "center",
      padding: "10px 14px",
      background: focused ? "var(--bg-elevated)" : "var(--bg-surface)",
      border: `1.5px solid ${focused ? "var(--accent-primary)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: focused ? "0 0 0 3px var(--accent-glow)" : "none",
      transition: "all 180ms ease",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "var(--radius-md)",
        background: focused ? "var(--accent-subtle)" : "var(--bg-overlay)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 180ms ease",
      }}>
        <Plus size={15} color={focused ? "var(--accent-primary)" : "var(--text-muted)"} />
      </div>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Thêm nhanh nhiệm vụ… nhấn Enter để lưu (mặc định deadline 23:59)"
        style={{
          flex: 1, background: "none", border: "none", outline: "none",
          color: "var(--text-primary)", fontSize: 14,
          fontFamily: "var(--font-sans)",
        }}
      />
      {val.trim() && (
        <button
          onClick={submit}
          style={{
            padding: "4px 12px", borderRadius: "var(--radius-md)",
            background: "var(--accent-primary)", border: "none",
            color: "#fff", fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 150ms ease",
            animation: "taskSlideIn 150ms ease both",
          }}
        >
          Thêm
        </button>
      )}
    </div>
  );
};

/* ── Skeleton card ────────────────────────────────────────────────────────── */
const SkeletonTaskCard = ({ delay = 0 }: { delay?: number }) => (
  <div style={{
    height: 72, borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-subtle)",
    overflow: "hidden", animationDelay: `${delay}ms`,
  }} className="skeleton-shimmer" />
);

/* ── Completion Badge Helper ──────────────────────────────────────────────── */
/**
 * Returns the completion status badge for a task that is done or done_late.
 *
 * Logic:
 *   - status === "done"      → green "✓ HH:mm"
 *   - status === "done_late" + has deadline + completedAt on same plannedDate
 *       → amber "⏰ Trễ HH:mm"  (completed in-day but after deadline)
 *   - status === "done_late" + completedAt on a different (later) day
 *       → red-orange "❌ Hoàn thành trễ"  (completed past the planned day)
 */
function getCompletionBadge(task: Task): React.ReactNode {
  if (task.status === "done") {
    // On time — show completion time in green
    const timeStr = task.completedAt ? fmtCompletedAt(task.completedAt) : "";
    return (
      <span style={{
        fontSize: 10, color: "var(--color-success)", fontWeight: 600,
        display: "flex", alignItems: "center", gap: 3,
      }}>
        ✓ {timeStr}
      </span>
    );
  }

  if (task.status === "done_late") {
    // Determine in-day vs cross-day
    const isInDay = (() => {
      if (!task.completedAt || !task.plannedDate) return false;
      // Compare calendar dates in user timezone
      const tz = getStoredTimezone();
      const toLocalDate = (iso: string) => {
        const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : iso + "Z";
        const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
          .formatToParts(new Date(normalized));
        return `${parts.find(p => p.type === "year")?.value}-${parts.find(p => p.type === "month")?.value}-${parts.find(p => p.type === "day")?.value}`;
      };
      const plannedDay   = task.plannedDate.split("T")[0]; // already YYYY-MM-DD from backend DATE field
      const completedDay = toLocalDate(task.completedAt);
      return completedDay === plannedDay;
    })();

    if (isInDay && task.completedAt) {
      // Late, but still within the planned day → show completion time
      const timeStr = fmtCompletedAt(task.completedAt);
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "2px 8px", borderRadius: "var(--radius-full)",
          fontSize: 10, fontWeight: 700,
          color: "#F59E0B",                          // amber
          background: "rgba(245,158,11,0.13)",
          border: "1px solid rgba(245,158,11,0.35)",
        }}>
          ⏰ Trễ {timeStr}
        </span>
      );
    }

    // Late across day boundary → no time, just label
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: "var(--radius-full)",
        fontSize: 10, fontWeight: 700,
        color: "#F97316",                            // orange-red
        background: "rgba(249,115,22,0.13)",
        border: "1px solid rgba(249,115,22,0.35)",
      }}>
        ❌ Hoàn thành trễ
      </span>
    );
  }

  return null;
}

/* ── Grid Task Card (Ô Vuông) ─────────────────────────────────────────────── */
const GridTaskCard: React.FC<{
  task: Task; isOverdue: boolean; index: number;
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
}> = ({ task, isOverdue, index, onEdit, onDelete, onToggle }) => {
  const [hover, setHover] = useState(false);
  const [checking, setChecking] = useState(false);

  // Both "done" and "done_late" count as completed for UI purposes
  const isDone     = task.status === "done" || task.status === "done_late";
  const isDoneLate = task.status === "done_late";

  const pri = PRIORITY[task.priority as keyof typeof PRIORITY] ?? PRIORITY.medium;
  const deadlineInfo = getDeadlineInfo(task.deadline, isDone);

  const handleToggle = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 400);
    onToggle();
  };

  const isActuallyOverdue = !isDone && (isOverdue || deadlineInfo.status === "overdue");

  const borderColor = isDone
    ? isDoneLate ? "rgba(249,115,22,0.5)" : "var(--color-success)"
    : isActuallyOverdue
    ? "var(--color-danger)"
    : pri.color;

  return (
    <div
      className="task-card-enter"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        gap: 12,
        padding: "16px",
        background: isDone
          ? "var(--bg-base)"
          : hover
          ? "var(--bg-elevated)"
          : "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${hover && !isDone ? "var(--border-default)" : "var(--border-subtle)"}`,
        borderTop: `4px solid ${borderColor}`,
        transition: "all 200ms ease",
        boxShadow: hover && !isDone ? `0 8px 24px rgba(0,0,0,0.22), 0 0 0 1px ${pri.color}30` : "none",
        transform: hover && !isDone ? "translateY(-3px)" : "translateY(0)",
        opacity: isDone ? (isDoneLate ? 0.72 : 0.6) : 1,
        animationDelay: `${index * 40}ms`,
        position: "relative",
        overflow: "hidden",
        minHeight: 160,
      }}
    >
      {/* Top bar: Priority Badge + Hover Actions + Checkbox */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 9px", borderRadius: "var(--radius-full)",
          fontSize: 10, fontWeight: 700,
          color: isDone ? "var(--text-muted)" : pri.color,
          background: isDone ? "var(--bg-overlay)" : pri.bg,
          border: `1px solid ${isDone ? "transparent" : pri.color}40`,
          boxShadow: !isDone ? `0 0 6px ${pri.glow}` : "none",
        }}>
          {pri.icon} {pri.label}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Actions on hover */}
          <div style={{
            display: "flex", gap: 4, opacity: hover ? 1 : 0,
            transition: "opacity 150ms ease",
          }}>
            <button
              onClick={onEdit}
              title="Chỉnh sửa"
              style={{
                width: 26, height: 26, borderRadius: "var(--radius-sm)",
                background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
                color: "var(--text-secondary)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={onDelete}
              title="Xóa"
              style={{
                width: 26, height: 26, borderRadius: "var(--radius-sm)",
                background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
                color: "#f87171", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>

          {/* Toggle checkbox */}
          <button
            onClick={handleToggle}
            className={checking ? "check-bounce" : ""}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              color: isDone
                ? isDoneLate ? "#F97316" : "var(--color-success)"
                : isActuallyOverdue ? "var(--color-danger)" : "var(--text-muted)",
              display: "flex", alignItems: "center",
              transition: "color 150ms, transform 150ms",
            }}
          >
            {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
          </button>
        </div>
      </div>

      {/* Middle: Title & Description Note Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{
          fontSize: 15, fontWeight: 700,
          color: isDone ? "var(--text-muted)" : isActuallyOverdue ? "var(--color-danger)" : "var(--text-primary)",
          textDecoration: isDone ? "line-through" : "none",
          lineHeight: 1.35, letterSpacing: "-0.01em",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {task.title}
        </div>

        {/* Note / Description Box */}
        {task.description && (
          <div style={{
            background: "var(--bg-overlay)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "8px 10px",
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.45,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginBottom: 3, fontWeight: 600 }}>
              <FileText size={10} /> Ghi chú:
            </span>
            {task.description}
          </div>
        )}
      </div>

      {/* Footer: Completion badge / Deadline badges + Tags */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 6, borderTop: "1px dashed var(--border-subtle)" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>

          {/* ── Completed state ── */}
          {isDone && getCompletionBadge(task)}

          {/* ── Pending / overdue deadline badges ── */}
          {!isDone && deadlineInfo.status === "overdue" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.35)" }}>
              <AlertCircle size={10} /> {deadlineInfo.label}
            </span>
          )}
          {!isDone && deadlineInfo.status === "due_soon" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 700, color: "var(--color-warning)", background: "rgba(255,179,71,0.15)", border: "1px solid rgba(255,179,71,0.35)", animation: "pulse 1.8s infinite" }}>
              <Clock size={10} /> ⚡ {deadlineInfo.label}
            </span>
          )}
          {!isDone && deadlineInfo.status === "normal" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 600, color: "var(--color-info)", background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)" }}>
              <Clock size={10} /> {deadlineInfo.label}
            </span>
          )}
          {!isDone && deadlineInfo.status === "none" && (
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
              Chưa có deadline
            </span>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {task.tags.map(t => (
              <span key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: "var(--radius-full)", fontSize: 9, fontWeight: 600, color: t.color || "var(--text-secondary)", background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
                <TagIcon size={8} /> {t.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Task Card Router (Grid vs List wrapper) ───────────────────────────────── */

const TaskCard: React.FC<{
  task: Task; isOverdue: boolean; index: number; viewMode: "grid" | "list";
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
}> = ({ task, isOverdue, index, viewMode, onEdit, onDelete, onToggle }) => {
  return (
    <GridTaskCard
      task={task} isOverdue={isOverdue} index={index}
      onEdit={onEdit} onDelete={onDelete} onToggle={onToggle}
    />
  );
};

/* ── Main Page ────────────────────────────────────────────────────────────── */
export const TasksPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<"" | "pending" | "done" | "done_late">("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dateStr = toDateStr(selectedDate);
  const isToday = dateStr === todayStr();
  const isPast = dateStr < todayStr();

  const { data, isLoading, error } = useTasks({
    plannedDate: dateStr,
    ...(filterStatus ? { status: filterStatus } : {}),
  });
  const createTask  = useCreateTask();
  const updateTask  = useUpdateTask();
  const deleteTask  = useDeleteTask();
  const completeTask   = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  const tasks: Task[] = data?.data ?? [];

  const { data: allDayData } = useTasks({ plannedDate: dateStr });
  const allDayTasks = allDayData?.data ?? [];
  const doneCount     = allDayTasks.filter(t => t.status === "done").length;
  const doneLateCount = allDayTasks.filter(t => t.status === "done_late").length;
  const totalCount    = allDayTasks.length;
  // Tasks remaining to do (not completed in any form)
  const pendingCount  = totalCount - doneCount - doneLateCount;

  const navigate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  };

  const handleQuickAdd = (title: string) => {
    createTask.mutate({ title, priority: "medium", isRecurring: false, tagIds: [], plannedDate: dateStr });
  };

  const handleCreateOrUpdate = (payload: any) => {
    const d = { ...payload, plannedDate: payload.plannedDate || dateStr };
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data: d }, {
        onSuccess: () => { setIsModalOpen(false); setEditingTask(null); },
      });
    } else {
      createTask.mutate(d, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Xóa nhiệm vụ này?")) deleteTask.mutate(id);
  };

  const handleToggle = (task: Task) => {
    // Both "done" and "done_late" → uncomplete back to pending
    if (task.status === "done" || task.status === "done_late") uncompleteTask.mutate(task.id);
    else completeTask.mutate(task.id);
  };

  const FILTERS: Array<{
    value: "" | "pending" | "done" | "done_late";
    label: string;
    count: number;
    icon: React.ReactNode;
    activeColor?: string;
    activeShadow?: string;
  }> = [
    { value: "",          label: "Tất cả",         count: totalCount,    icon: <ListChecks size={13} /> },
    { value: "pending",   label: "Đang làm",        count: pendingCount,  icon: <Clock4 size={13} /> },
    { value: "done",      label: "Đã hoàn thành",   count: doneCount,     icon: <CheckCircle2 size={13} /> },
    {
      value: "done_late",
      label: "Hoàn thành trễ",
      count: doneLateCount,
      icon: <AlarmClock size={13} />,
      activeColor: "#F97316",
      activeShadow: "0 2px 8px rgba(249,115,22,0.4)",
    },
  ];

  return (
    <>
      {/* Inject keyframe styles */}
      <style>{styleTag}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Hero Header ── */}
        <div style={{
          background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Accent glow */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200,
            background: "var(--accent-glow)",
            borderRadius: "50%", filter: "blur(70px)",
            pointerEvents: "none",
          }} />
          {isPast && !isToday && (
            <div style={{
              position: "absolute", top: -30, left: -30,
              width: 120, height: 120,
              background: "rgba(248,113,113,0.08)",
              borderRadius: "50%", filter: "blur(40px)",
              pointerEvents: "none",
            }} />
          )}

          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

            {/* Date Navigator */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  width: 34, height: 34, borderRadius: "var(--radius-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)", cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-subtle)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-primary)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-primary)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ textAlign: "center", minWidth: 140 }}>
                <div style={{
                  fontSize: 17, fontWeight: 700,
                  color: isToday ? "var(--accent-primary)" : isPast ? "var(--color-danger)" : "var(--text-primary)",
                  letterSpacing: "-0.01em", lineHeight: 1.2,
                }}>
                  {fmtDateLabel(selectedDate)}
                </div>
                {isPast && !isToday && (
                  <div style={{ fontSize: 11, color: "var(--color-danger)", marginTop: 3, opacity: 0.8 }}>
                    📅 Xem lại ngày cũ
                  </div>
                )}
                {isToday && (
                  <div style={{ fontSize: 11, color: "var(--accent-primary)", marginTop: 3, opacity: 0.7 }}>
                    ✦ Hôm nay
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(1)}
                style={{
                  width: 34, height: 34, borderRadius: "var(--radius-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)", cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-subtle)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-primary)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-primary)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                }}
              >
                <ChevronRight size={16} />
              </button>

              {!isToday && (
                <button
                  onClick={() => setSelectedDate(new Date())}
                  style={{
                    padding: "5px 12px", borderRadius: "var(--radius-full)",
                    background: "var(--accent-subtle)", border: "1px solid var(--accent-primary)",
                    color: "var(--accent-primary)", cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    transition: "all 150ms",
                  }}
                >
                  Hôm nay
                </button>
              )}

              {/* Date picker icon */}
              <div style={{ position: "relative" }}>
                <input
                  type="date" value={dateStr}
                  onChange={e => { if (e.target.value) setSelectedDate(new Date(e.target.value + "T00:00:00")); }}
                  style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer", zIndex: 2 }}
                />
                <button style={{
                  width: 34, height: 34, borderRadius: "var(--radius-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)", cursor: "pointer", position: "relative",
                }}>
                  <Calendar size={15} />
                </button>
              </div>
            </div>

            {/* Right: Progress + Add */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {totalCount > 0 && <ProgressRing done={doneCount + doneLateCount} total={totalCount} />}
              <Button variant="primary" size="sm"
                leftIcon={<Plus size={15} />}
                onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
                Thêm nhiệm vụ
              </Button>
            </div>
          </div>
        </div>

        {/* ── Filter Bar & View Mode Switcher ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {/* Filter Tabs */}
          <div style={{
            display: "flex", gap: 6,
            background: "var(--bg-surface)",
            padding: "5px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            width: "fit-content",
          }}>
            {FILTERS.map(f => {
              const active = filterStatus === f.value;
              const btnColor = active ? (f.activeColor ?? "var(--accent-primary)") : "transparent";
              const btnShadow = active ? (f.activeShadow ?? "0 2px 8px var(--accent-glow)") : "none";
              return (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    background: btnColor,
                    color: active ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: active ? 600 : 400,
                    fontSize: 13,
                    transition: "all 180ms ease",
                    boxShadow: btnShadow,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <span style={{ opacity: active ? 1 : 0.6 }}>{f.icon}</span>
                  {f.label}
                  <span style={{
                    padding: "1px 6px",
                    borderRadius: "var(--radius-full)",
                    fontSize: 10,
                    fontWeight: 700,
                    background: active ? "rgba(255,255,255,0.25)" : "var(--bg-overlay)",
                    color: active ? "#fff" : "var(--text-muted)",
                    minWidth: 20,
                    textAlign: "center",
                  }}>
                    {f.count}
                  </span>
                </button>
              );
            })}

          </div>

          {/* View Mode Switcher */}
          <div style={{
            display: "flex", gap: 4,
            background: "var(--bg-surface)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: "var(--radius-sm)",
                border: "none",
                background: viewMode === "grid" ? "var(--bg-elevated)" : "transparent",
                color: viewMode === "grid" ? "var(--accent-primary)" : "var(--text-muted)",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                transition: "all 150ms ease",
              }}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: "var(--radius-sm)",
                border: "none",
                background: viewMode === "list" ? "var(--bg-elevated)" : "transparent",
                color: viewMode === "list" ? "var(--accent-primary)" : "var(--text-muted)",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                transition: "all 150ms ease",
              }}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>

        {/* ── Quick Add ── */}
        <QuickAdd onAdd={handleQuickAdd} />

        {/* ── Task List ── */}
        {isLoading ? (
          <div style={{
            display: viewMode === "grid" ? "grid" : "flex",
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : undefined,
            flexDirection: viewMode === "list" ? "column" : undefined,
            gap: 12,
          }}>
            <SkeletonTaskCard delay={0} />
            <SkeletonTaskCard delay={80} />
            <SkeletonTaskCard delay={160} />
          </div>
        ) : error ? (
          <div style={{
            textAlign: "center", padding: 32,
            color: "var(--color-danger)",
            background: "rgba(248,113,113,0.06)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(248,113,113,0.2)",
          }}>
            <AlertCircle size={32} style={{ marginBottom: 8, opacity: 0.7 }} />
            <div style={{ fontWeight: 600 }}>Lỗi tải dữ liệu</div>
            <div style={{ fontSize: 12, marginTop: 4, color: "var(--text-muted)" }}>Vui lòng kiểm tra kết nối và thử lại.</div>
          </div>
        ) : tasks.length === 0 ? (
          <div style={{
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "40px 24px",
          }}>
            <EmptyState
              icon={filterStatus === "done"
                ? <CheckCircle2 size={44} />
                : filterStatus === "done_late"
                ? <AlarmClock size={44} />
                : filterStatus === "pending"
                ? <FilterX size={44} />
                : <CheckSquare2 size={44} />
              }
              title={
                filterStatus === "done" ? "Chưa hoàn thành gì hôm nay" :
                filterStatus === "done_late" ? "Không có task hoàn thành trễ" :
                filterStatus === "pending" ? "Không còn việc nào đang chờ" :
                isToday ? "Hôm nay chưa có nhiệm vụ nào" :
                "Không có nhiệm vụ ngày này"
              }
              description={filterStatus === "" && isToday ? "Dùng ô nhập nhanh bên trên hoặc nhấn nút để thêm nhiệm vụ." : ""}
              action={filterStatus === "" ? { label: "Thêm nhiệm vụ", onClick: () => setIsModalOpen(true) } : undefined}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ── Helper: shared grid wrapper ── */}
            {(() => {
              const pendingTasks   = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
              const doneTasks      = tasks.filter(t => t.status === "done");
              const doneLateTask   = tasks.filter(t => t.status === "done_late");

              const gridStyle: React.CSSProperties = {
                display: viewMode === "grid" ? "grid" : "flex",
                gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(290px, 1fr))" : undefined,
                flexDirection: viewMode === "list" ? "column" : undefined,
                gap: 14,
              };

              const renderCards = (group: Task[], baseIndex = 0) =>
                group.map((task, i) => {
                  const pd = parsePlannedDate(task.plannedDate);
                  const isOverdue = !!(pd && pd < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== "done" && task.status !== "done_late");
                  return (
                    <TaskCard
                      key={task.id} task={task} isOverdue={isOverdue}
                      index={baseIndex + i} viewMode={viewMode}
                      onEdit={() => { setEditingTask(task); setIsModalOpen(true); }}
                      onDelete={() => handleDelete(task.id)}
                      onToggle={() => handleToggle(task)}
                    />
                  );
                });

              return (
                <>
                  {/* ── Section 1: Đang làm ── */}
                  {pendingTasks.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Only show header when "all" tab + other sections also present */}
                      {filterStatus === "" && (doneTasks.length > 0 || doneLateTask.length > 0) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Clock4 size={13} color="var(--accent-primary)" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.05em" }}>
                            ĐANG LÀM ({pendingTasks.length})
                          </span>
                          <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                        </div>
                      )}
                      <div style={gridStyle}>{renderCards(pendingTasks, 0)}</div>
                    </div>
                  )}

                  {/* ── Section 2: Đã hoàn thành ── */}
                  {doneTasks.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Show header when "all" tab OR "done_late" tab (so user sees done vs late split) */}
                      {(filterStatus === "" || filterStatus === "done_late") && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <CheckCircle2 size={13} color="var(--color-success)" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-success)", letterSpacing: "0.05em" }}>
                            ĐÃ HOÀN THÀNH ({doneTasks.length})
                          </span>
                          <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                        </div>
                      )}
                      <div style={gridStyle}>{renderCards(doneTasks, pendingTasks.length)}</div>
                    </div>
                  )}

                  {/* ── Section 3: Hoàn thành trễ ── */}
                  {doneLateTask.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Always show header for done_late section — it's distinct */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <AlarmClock size={13} color="#F97316" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#F97316", letterSpacing: "0.05em" }}>
                          HOÀN THÀNH TRỄ ({doneLateTask.length})
                        </span>
                        <div style={{ flex: 1, height: 1, background: "rgba(249,115,22,0.25)" }} />
                      </div>
                      <div style={gridStyle}>{renderCards(doneLateTask, pendingTasks.length + doneTasks.length)}</div>
                    </div>
                  )}
                </>
              );
            })()}

          </div>
        )}


        <TaskFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
          onSubmit={handleCreateOrUpdate}
          initialData={editingTask}
          defaultDate={dateStr}
          isLoading={createTask.isPending || updateTask.isPending}
        />
      </div>
    </>
  );
};
