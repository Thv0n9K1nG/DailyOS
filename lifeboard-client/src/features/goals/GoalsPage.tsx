import React, { useState, useMemo } from "react";
import {
  Target, Plus, Trash2, Edit2, TrendingUp, CheckCircle,
  PauseCircle, Trophy, Flame, Clock, BarChart2, Sparkles,
  Calendar, AlertCircle,
} from "lucide-react";
import {
  useGoals, useCreateGoal, useUpdateGoal, useUpdateGoalProgress, useDeleteGoal,
} from "./hooks/useGoals";
import { Goal, CreateGoalPayload, UpdateGoalPayload } from "./api/goalApi";
import { GoalFormModal } from "./GoalFormModal";
import { UpdateProgressModal } from "./UpdateProgressModal";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/SkeletonCard";

// ── Types ──────────────────────────────────────────────────────────────────────
type FilterTab = "all" | "active" | "paused" | "completed";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: "Đang thực hiện",
    color: "var(--accent-primary)",
    bg: "rgba(61,142,240,0.12)",
    border: "rgba(61,142,240,0.25)",
    icon: <TrendingUp size={12} />,
  },
  completed: {
    label: "Hoàn thành",
    color: "var(--color-success)",
    bg: "rgba(82,215,191,0.12)",
    border: "rgba(82,215,191,0.25)",
    icon: <CheckCircle size={12} />,
  },
  paused: {
    label: "Tạm dừng",
    color: "var(--color-warning)",
    bg: "rgba(255,179,71,0.12)",
    border: "rgba(255,179,71,0.25)",
    icon: <PauseCircle size={12} />,
  },
};

const TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
  { key: "all",       label: "Tất cả",         icon: <BarChart2 size={14} /> },
  { key: "active",    label: "Đang thực hiện",  icon: <TrendingUp size={14} /> },
  { key: "paused",    label: "Tạm dừng",        icon: <PauseCircle size={14} /> },
  { key: "completed", label: "Hoàn thành",      icon: <CheckCircle size={14} /> },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function getDeadlineLabel(deadline?: string): { text: string; urgent: boolean } | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.setHours(0,0,0,0)) / 86400000);
  if (diffDays < 0)  return { text: `Quá hạn ${Math.abs(diffDays)} ngày`, urgent: true };
  if (diffDays === 0) return { text: "Hôm nay là hạn chót!", urgent: true };
  if (diffDays <= 7)  return { text: `Còn ${diffDays} ngày`, urgent: true };
  return {
    text: d.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" }),
    urgent: false,
  };
}

function getProgressColor(pct: number, status: string): string {
  if (status === "completed") return "var(--color-success)";
  if (status === "paused")    return "var(--color-warning)";
  if (pct >= 80) return "linear-gradient(90deg, var(--accent-primary), var(--color-success))";
  if (pct >= 40) return "linear-gradient(90deg, var(--accent-primary), var(--color-info))";
  return "linear-gradient(90deg, var(--accent-primary), var(--color-purple))";
}

// ── GoalCard ──────────────────────────────────────────────────────────────────
interface GoalCardProps {
  goal: Goal;
  index: number;
  onEdit: (g: Goal) => void;
  onUpdateProgress: (g: Goal) => void;
  onDelete: (id: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, index, onEdit, onUpdateProgress, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG.active;
  const pct = Math.min(100, Math.round(goal.progressPercent));
  const deadlineInfo = getDeadlineLabel(goal.deadline);
  const progressColor = getProgressColor(pct, goal.status);
  const isCompleted = goal.status === "completed";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${hovered ? cfg.border : "var(--border-subtle)"}`,
        padding: "var(--space-5)",
        position: "relative",
        overflow: "hidden",
        transition: "all 200ms ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `var(--shadow-md), 0 0 0 1px ${cfg.border}` : "none",
        animation: `slideUp 280ms ${index * 50}ms ease both`,
      }}
    >
      {/* Completed shimmer overlay */}
      {isCompleted && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 2,
          background: "linear-gradient(90deg, transparent, var(--color-success), transparent)",
          animation: "shimmer 2s infinite",
        }} />
      )}

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: "var(--space-2)" }}>
          {/* Title + Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-1)" }}>
            <span style={{
              fontSize: "var(--text-base)", fontWeight: 700,
              color: isCompleted ? "var(--color-success)" : "var(--text-primary)",
              lineHeight: 1.3,
            }}>
              {isCompleted && "✅ "}
              {goal.title}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: "var(--radius-full)",
              fontSize: "var(--text-xs)", fontWeight: 600,
              color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
              flexShrink: 0,
            }}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          {goal.description && (
            <p style={{
              fontSize: "var(--text-xs)", color: "var(--text-muted)",
              lineHeight: 1.5, marginBottom: "var(--space-1)",
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {goal.description}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{
          display: "flex", gap: 4, flexShrink: 0,
          opacity: hovered ? 1 : 0,
          transition: "opacity 150ms ease",
        }}>
          <button
            onClick={() => onEdit(goal)}
            title="Chỉnh sửa"
            style={{
              width: 28, height: 28, borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            title="Xóa"
            style={{
              width: 28, height: 28, borderRadius: "var(--radius-sm)",
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
              color: "var(--color-danger)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Progress section */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              {goal.currentValue}
            </span>
            {" / "}
            <span style={{ fontFamily: "var(--font-mono)" }}>{goal.targetValue}</span>
            {" "}{goal.unit}
          </span>
          <span style={{
            fontSize: "var(--text-sm)", fontWeight: 800,
            color: pct >= 100 ? "var(--color-success)" : cfg.color,
            fontFamily: "var(--font-mono)",
          }}>
            {pct}%
          </span>
        </div>
        {/* Bar track */}
        <div style={{
          background: "var(--bg-overlay)",
          borderRadius: "var(--radius-full)",
          height: 8, overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: progressColor,
            borderRadius: "var(--radius-full)",
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
            position: "relative",
          }}>
            {/* Shine effect on bar */}
            {pct > 5 && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
                borderRadius: "var(--radius-full)",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: deadline + action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          {deadlineInfo && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: "var(--text-xs)", fontWeight: 500,
              color: deadlineInfo.urgent ? "var(--color-danger)" : "var(--text-muted)",
            }}>
              {deadlineInfo.urgent
                ? <AlertCircle size={11} />
                : <Calendar size={11} />}
              {deadlineInfo.text}
            </span>
          )}
          {!goal.deadline && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontStyle: "italic" }}>
              Không giới hạn
            </span>
          )}
        </div>

        {!isCompleted && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onUpdateProgress(goal)}
            style={{ fontSize: "var(--text-xs)" }}
          >
            <TrendingUp size={11} /> Cập nhật
          </Button>
        )}
        {isCompleted && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: "var(--text-xs)", color: "var(--color-success)", fontWeight: 600,
          }}>
            <Trophy size={12} /> Đã hoàn thành
          </span>
        )}
      </div>
    </div>
  );
};

// ── StatsBar ──────────────────────────────────────────────────────────────────
const StatsBar: React.FC<{ goals: Goal[] }> = ({ goals }) => {
  const total     = goals.length;
  const active    = goals.filter(g => g.status === "active").length;
  const completed = goals.filter(g => g.status === "completed").length;
  const paused    = goals.filter(g => g.status === "paused").length;
  const avgPct    = total > 0
    ? Math.round(goals.reduce((s, g) => s + Math.min(100, g.progressPercent), 0) / total)
    : 0;

  const stats = [
    { label: "Tổng mục tiêu", value: total,     icon: <Target size={16} />,     color: "var(--text-primary)" },
    { label: "Đang thực hiện", value: active,   icon: <Flame size={16} />,       color: "var(--accent-primary)" },
    { label: "Hoàn thành",    value: completed,  icon: <Trophy size={16} />,      color: "var(--color-success)" },
    { label: "Tạm dừng",      value: paused,    icon: <Clock size={16} />,       color: "var(--color-warning)" },
    { label: "Tiến độ TB",    value: `${avgPct}%`, icon: <Sparkles size={16} />, color: "var(--color-info)" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "var(--space-3)",
      marginBottom: "var(--space-5)",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3) var(--space-4)",
          display: "flex", flexDirection: "column", gap: 4,
          animation: `slideUp 200ms ${i * 40}ms ease both`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: s.color }}>
            {s.icon}
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
              {s.label}
            </span>
          </div>
          <div style={{
            fontSize: "var(--text-xl)", fontWeight: 800,
            color: s.color, fontFamily: "var(--font-mono)", lineHeight: 1,
          }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── GoalsPage (main) ──────────────────────────────────────────────────────────
export const GoalsPage: React.FC = () => {
  const { data: goals = [], isLoading, isError } = useGoals();
  const createGoal    = useCreateGoal();
  const updateGoal    = useUpdateGoal();
  const updateProgress = useUpdateGoalProgress();
  const deleteGoal    = useDeleteGoal();

  const [activeTab,      setActiveTab]      = useState<FilterTab>("all");
  const [isFormOpen,     setIsFormOpen]     = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [editingGoal,    setEditingGoal]    = useState<Goal | null>(null);
  const [progressGoal,   setProgressGoal]  = useState<Goal | null>(null);

  // Filtered goals
  const filtered = useMemo(() => {
    if (activeTab === "all") return goals;
    return goals.filter(g => g.status === activeTab);
  }, [goals, activeTab]);

  // Tab counts
  const counts = useMemo(() => ({
    all:       goals.length,
    active:    goals.filter(g => g.status === "active").length,
    paused:    goals.filter(g => g.status === "paused").length,
    completed: goals.filter(g => g.status === "completed").length,
  }), [goals]);

  // Handlers
  const handleOpenCreate = () => { setEditingGoal(null); setIsFormOpen(true); };
  const handleOpenEdit   = (g: Goal) => { setEditingGoal(g); setIsFormOpen(true); };
  const handleOpenProgress = (g: Goal) => { setProgressGoal(g); setIsProgressOpen(true); };

  const handleFormSubmit = (payload: CreateGoalPayload | UpdateGoalPayload, id?: number) => {
    if (id !== undefined) {
      updateGoal.mutate(
        { id, data: payload as UpdateGoalPayload },
        { onSuccess: () => setIsFormOpen(false) },
      );
    } else {
      createGoal.mutate(
        payload as CreateGoalPayload,
        { onSuccess: () => setIsFormOpen(false) },
      );
    }
  };

  const handleProgressSubmit = (id: number, newValue: number) => {
    updateProgress.mutate(
      { id, currentValue: newValue },
      { onSuccess: () => setIsProgressOpen(false) },
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa mục tiêu này? Hành động này không thể hoàn tác.")) {
      deleteGoal.mutate(id);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

      {/* ── Header ── */}
      <div style={{
        padding: "var(--space-6)",
        background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative glow */}
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          background: "rgba(61,142,240,0.08)", borderRadius: "50%", filter: "blur(50px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -20, left: 60, width: 120, height: 120,
          background: "rgba(82,215,191,0.06)", borderRadius: "50%", filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "var(--radius-md)",
              background: "rgba(61,142,240,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent-primary)", flexShrink: 0,
            }}>
              <Target size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Mục tiêu dài hạn
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: "var(--space-1) 0 0" }}>
                Đặt mục tiêu lớn, bước từng bước nhỏ, đạt đến đích.
              </p>
            </div>
          </div>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleOpenCreate}>
            Thêm mục tiêu
          </Button>
        </div>
      </div>

      {/* ── Stats (only when data exists) ── */}
      {!isLoading && goals.length > 0 && <StatsBar goals={goals} />}

      {/* ── Filter Tabs ── */}
      {!isLoading && goals.length > 0 && (
        <div style={{
          display: "flex", gap: "var(--space-1)",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)",
          padding: 4,
          border: "1px solid var(--border-subtle)",
          width: "fit-content",
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const count = counts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: isActive ? "var(--accent-primary)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  fontSize: "var(--text-sm)", fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {tab.icon}
                {tab.label}
                <span style={{
                  background: isActive ? "rgba(255,255,255,0.25)" : "var(--bg-overlay)",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  borderRadius: "var(--radius-full)",
                  padding: "1px 6px",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  minWidth: 18, textAlign: "center",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <SkeletonList count={4} />
      ) : isError ? (
        <div style={{
          padding: "var(--space-10)",
          textAlign: "center",
          background: "var(--bg-surface)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: "var(--radius-lg)",
        }}>
          <AlertCircle size={40} style={{ color: "var(--color-danger)", marginBottom: "var(--space-3)" }} />
          <p style={{ color: "var(--color-danger)", fontWeight: 600 }}>Không thể tải dữ liệu mục tiêu.</p>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: "var(--space-1)" }}>
            Vui lòng kiểm tra kết nối đến server và thử lại.
          </p>
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<Target size={52} />}
          title="Chưa có mục tiêu nào"
          description="Đặt ra mục tiêu dài hạn và theo dõi từng bước tiến của bạn mỗi ngày."
          action={{ label: "Tạo mục tiêu đầu tiên", onClick: handleOpenCreate }}
        />
      ) : filtered.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "var(--space-3)", padding: "var(--space-12) var(--space-8)",
          textAlign: "center",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
        }}>
          <div style={{ opacity: 0.25, color: "var(--text-muted)" }}>
            {TABS.find(t => t.key === activeTab)?.icon}
          </div>
          <p style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-secondary)" }}>
            Không có mục tiêu nào trong trạng thái "{TABS.find(t => t.key === activeTab)?.label}"
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            Thêm mục tiêu mới hoặc chuyển sang tab khác.
          </p>
          <Button variant="secondary" size="sm" onClick={handleOpenCreate}>
            <Plus size={14} /> Tạo mục tiêu mới
          </Button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "var(--space-4)",
        }}>
          {filtered.map((goal, idx) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={idx}
              onEdit={handleOpenEdit}
              onUpdateProgress={handleOpenProgress}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <GoalFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingGoal={editingGoal}
        isLoading={createGoal.isPending || updateGoal.isPending}
      />

      <UpdateProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        onSubmit={handleProgressSubmit}
        goal={progressGoal}
        isLoading={updateProgress.isPending}
      />
    </div>
  );
};
