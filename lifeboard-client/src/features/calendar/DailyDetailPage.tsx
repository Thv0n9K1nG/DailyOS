import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, Plus, FileText, Clock } from "lucide-react";
import { useTasks, useCompleteTask, useUncompleteTask, useCreateTask } from "../tasks/hooks/useTasks";
import { Button } from "../../components/ui/Button";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import { TaskFormModal } from "../tasks/TaskFormModal";

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  return `${days[d.getDay()]}, ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high:   { label: "Cao",     color: "var(--priority-high)" },
  medium: { label: "Vừa",     color: "var(--priority-medium)" },
  low:    { label: "Thấp",    color: "var(--priority-low)" },
};

export const DailyDetailPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState("");

  const { data, isLoading } = useTasks({ plannedDate: date });
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const createTask = useCreateTask();

  const tasks = data?.data || [];
  const done = tasks.filter(t => t.status === "done").length;
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  if (!date) return null;

  const handleCreateTask = (payload: any) => {
    createTask.mutate(
      { ...payload, plannedDate: new Date(date).toISOString() },
      { onSuccess: () => setIsModalOpen(false) }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Back + Date Header */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-5) var(--space-6)",
        }}
      >
        <button
          onClick={() => navigate("/calendar")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: "var(--space-4)",
            padding: 0,
            transition: "color 150ms ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={14} />
          Quay lại lịch
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {formatDateDisplay(date)}
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "var(--space-1)", margin: 0 }}>
              {tasks.length === 0
                ? "Không có nhiệm vụ nào"
                : `${done}/${tasks.length} nhiệm vụ đã hoàn thành`}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={14} />}
          >
            Thêm Task
          </Button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div style={{ marginTop: "var(--space-4)" }}>
            <div
              style={{
                height: 6,
                background: "var(--bg-overlay)",
                borderRadius: "var(--radius-full)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: progress === 100
                    ? "var(--color-success)"
                    : "linear-gradient(90deg, var(--accent-primary), var(--color-info))",
                  borderRadius: "var(--radius-full)",
                  transition: "width 600ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--space-5)" }}>
        {/* Tasks */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-5)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "var(--space-4)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Clock size={16} style={{ color: "var(--accent-primary)" }} />
            Nhiệm vụ trong ngày
          </h3>

          {isLoading ? (
            <SkeletonList count={3} />
          ) : tasks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-10) var(--space-6)",
                color: "var(--text-muted)",
                fontSize: "var(--text-sm)",
              }}
            >
              <CheckCircle size={40} style={{ margin: "0 auto var(--space-3)", opacity: 0.3 }} />
              <p style={{ margin: 0 }}>Không có nhiệm vụ nào</p>
              <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)" }}>
                Thêm task để bắt đầu lên kế hoạch
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {tasks.map(task => {
                const pri = PRIORITY_CONFIG[task.priority];
                return (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                      borderLeft: `3px solid ${pri.color}`,
                      background: task.status === "done" ? "var(--bg-base)" : "var(--bg-elevated)",
                      transition: "all 150ms ease",
                      animation: "slideInLeft 200ms ease both",
                    }}
                  >
                    <button
                      onClick={() =>
                        task.status === "done"
                          ? uncompleteTask.mutate(task.id)
                          : completeTask.mutate(task.id)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        color: task.status === "done" ? "var(--color-success)" : "var(--text-muted)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        transition: "color 150ms ease, transform 150ms ease",
                      }}
                    >
                      {task.status === "done" ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "var(--text-base)",
                          fontWeight: 500,
                          color: task.status === "done" ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: task.status === "done" ? "line-through" : "none",
                        }}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                          {task.description}
                        </div>
                      )}
                    </div>

                    {/* Priority badge */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        color: pri.color,
                        background: `${pri.color}22`,
                      }}
                    >
                      {pri.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes panel */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-5)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "var(--space-4)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <FileText size={16} style={{ color: "var(--color-warning)" }} />
            Ghi chú
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                fontWeight: 400,
                marginLeft: "auto",
              }}
            >
              Stage 3
            </span>
          </h3>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Viết ghi chú cho ngày này... (Markdown sẽ được hỗ trợ ở Stage 3)"
            style={{
              flex: 1,
              minHeight: 200,
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              padding: "var(--space-3)",
              resize: "vertical",
              outline: "none",
              fontFamily: "var(--font-sans)",
              lineHeight: 1.6,
              transition: "border-color 150ms ease",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
          />
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-2)", margin: "var(--space-2) 0 0" }}>
            💡 Tính năng lưu sẽ hoàn thiện ở Stage 3
          </p>
        </div>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        initialData={null}
        isLoading={createTask.isPending}
      />
    </div>
  );
};
