import React, { useState } from "react";
import {
  Plus, CheckSquare, Trash2, Edit2, Sunrise,
  CalendarDays, AlertTriangle, Tag,
} from "lucide-react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../tasks/hooks/useTasks";
import { Task } from "../tasks/api/taskApi";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import { TaskFormModal } from "../tasks/TaskFormModal";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: "Cao",  color: "var(--priority-high)",   bg: "rgba(248,113,113,0.12)" },
  medium: { label: "Vừa", color: "var(--priority-medium)", bg: "rgba(255,179,71,0.12)" },
  low:    { label: "Thấp", color: "var(--priority-low)",   bg: "rgba(82,215,191,0.12)" },
};

function formatTomorrow(date: Date) {
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  return `${days[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
}

function formatDeadline(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
  const isOverdue = diff < 0;
  return { text: isOverdue ? `Quá hạn ${Math.abs(diff)}d` : `${dateStr}`, overdue: isOverdue };
}

export const TomorrowPage: React.FC = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data, isLoading } = useTasks({ plannedDate: tomorrowStr });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hoverRow, setHoverRow] = useState<number | null>(null);

  const tasks = data?.data || [];
  const highCount = tasks.filter(t => t.priority === "high").length;
  const medCount  = tasks.filter(t => t.priority === "medium").length;
  const lowCount  = tasks.filter(t => t.priority === "low").length;

  const handleCreateOrUpdate = (payload: any) => {
    const p = { ...payload, plannedDate: new Date(tomorrowStr + "T00:00:00").toISOString() };
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data: p }, {
        onSuccess: () => { setIsModalOpen(false); setEditingTask(null); },
      });
    } else {
      createTask.mutate(p, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Xóa nhiệm vụ này?")) deleteTask.mutate(id);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

      {/* Hero header */}
      <div style={{
        padding: "var(--space-6)",
        background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative glow */}
        <div style={{
          position: "absolute", top: -30, right: -30, width: 160, height: 160,
          background: "rgba(255,179,71,0.1)", borderRadius: "50%", filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "var(--radius-md)",
              background: "rgba(255,179,71,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-warning)", flexShrink: 0,
            }}>
              <Sunrise size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Kế hoạch ngày mai
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: "var(--space-1) 0 0" }}>
                {formatTomorrow(tomorrow)}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          >
            Thêm Task
          </Button>
        </div>

        {/* Summary row */}
        {tasks.length > 0 && (
          <div style={{
            display: "flex", gap: "var(--space-4)", marginTop: "var(--space-5)",
            padding: "var(--space-4)",
            background: "var(--bg-overlay)", borderRadius: "var(--radius-md)",
            flexWrap: "wrap",
          }}>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{tasks.length}</span> nhiệm vụ
            </div>
            {highCount > 0 && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--priority-high)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--priority-high)" }} />
                {highCount} cao
              </div>
            )}
            {medCount > 0 && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--priority-medium)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--priority-medium)" }} />
                {medCount} vừa
              </div>
            )}
            {lowCount > 0 && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--priority-low)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--priority-low)" }} />
                {lowCount} thấp
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task list */}
      {isLoading ? (
        <SkeletonList count={4} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<Sunrise size={48} />}
          title="Chưa có kế hoạch cho ngày mai"
          description="Hãy chuẩn bị sẵn sàng bằng cách lên kế hoạch ngay hôm nay."
          action={{ label: "+ Thêm nhiệm vụ", onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {tasks.map((task, idx) => {
            const pri = PRIORITY_CONFIG[task.priority];
            const deadline = formatDeadline(task.deadline);
            return (
              <div
                key={task.id}
                onMouseEnter={() => setHoverRow(task.id)}
                onMouseLeave={() => setHoverRow(null)}
                style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "var(--space-4)",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: `3px solid ${pri.color}`,
                  transition: "all 150ms ease",
                  animation: `slideInLeft 200ms ${idx * 40}ms ease both`,
                }}
              >
                {/* Drag handle placeholder */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0, cursor: "grab", opacity: hoverRow === task.id ? 0.5 : 0.2, transition: "opacity 150ms" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 12, height: 2, background: "var(--text-muted)", borderRadius: 1 }} />
                  ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "var(--text-base)", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {task.description}
                    </div>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "var(--space-1)", marginTop: "var(--space-1)", flexWrap: "wrap" }}>
                      {task.tags.map(tag => (
                        <span key={tag.id} style={{ padding: "1px 6px", borderRadius: "var(--radius-full)", fontSize: 10, background: "var(--bg-overlay)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 3 }}>
                          <Tag size={8} />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Badges + Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
                  {deadline && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 3,
                      padding: "2px 7px", borderRadius: "var(--radius-full)",
                      fontSize: 10, fontWeight: 600,
                      color: deadline.overdue ? "var(--color-danger)" : "var(--text-muted)",
                      background: deadline.overdue ? "rgba(248,113,113,0.1)" : "var(--bg-overlay)",
                    }}>
                      {deadline.overdue ? <AlertTriangle size={9} /> : <CalendarDays size={9} />}
                      {deadline.text}
                    </span>
                  )}
                  <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 600, color: pri.color, background: pri.bg }}>
                    {pri.label}
                  </span>
                  <div style={{ display: "flex", gap: "var(--space-1)", opacity: hoverRow === task.id ? 1 : 0, transition: "opacity 150ms ease" }}>
                    <button
                      onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                      style={{ padding: "var(--space-1) var(--space-2)", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      style={{ padding: "var(--space-1) var(--space-2)", borderRadius: "var(--radius-sm)", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--color-danger)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTask}
        isLoading={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
};
