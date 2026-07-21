import React, { useState, useMemo } from "react";
import {
  Plus, CheckCircle, Circle, Trash2, Edit2, CheckSquare, Tag,
  CalendarDays, AlertTriangle,
} from "lucide-react";
import {
  useTasks, useCreateTask, useUpdateTask,
  useDeleteTask, useCompleteTask, useUncompleteTask,
} from "./hooks/useTasks";
import { Task } from "./api/taskApi";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import { TaskFormModal } from "./TaskFormModal";

type FilterStatus = "" | "pending" | "done";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: "Cao",  color: "var(--priority-high)",   bg: "rgba(248,113,113,0.12)" },
  medium: { label: "Vừa", color: "var(--priority-medium)", bg: "rgba(255,179,71,0.12)" },
  low:    { label: "Thấp", color: "var(--priority-low)",   bg: "rgba(82,215,191,0.12)" },
};

function formatDeadline(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
  const isOverdue = diff < 0;
  return { text: isOverdue ? `Quá hạn ${Math.abs(diff)}d` : `${dateStr}`, overdue: isOverdue };
}

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (t: Task) => void;
  onDelete: (id: number) => void;
  onToggle: (t: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete, onToggle }) => {
  const [showActions, setShowActions] = useState(false);
  const pri = PRIORITY_CONFIG[task.priority];
  const isDone = task.status === "done";

  // Task is overdue if not completed and planned date is in the past compared to today
  const isOverdue = useMemo(() => {
    if (isDone || !task.plannedDate) return false;
    const planned = new Date(task.plannedDate.split('T')[0]).getTime();
    const today = new Date().setHours(0,0,0,0);
    return planned < today;
  }, [task.plannedDate, isDone]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-4)",
        background: isDone ? "var(--bg-base)" : isOverdue ? "rgba(239, 68, 68, 0.05)" : "var(--bg-surface)",
        borderRadius: "var(--radius-md)",
        border: isOverdue ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid var(--border-subtle)",
        borderLeft: isOverdue ? "3px solid var(--color-danger)" : `3px solid ${pri.color}`,
        transition: "all 150ms ease",
        animation: `slideInLeft 200ms ${index * 40}ms ease both`,
        position: "relative",
        cursor: "default",
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        aria-label={isDone ? "Đánh dấu chưa xong" : "Hoàn thành"}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          color: isDone ? "var(--color-success)" : isOverdue ? "var(--color-danger)" : "var(--text-muted)",
          flexShrink: 0, display: "flex", alignItems: "center",
          transition: "color 150ms ease, transform 150ms ease",
        }}
        onMouseEnter={e => !isDone && ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-success)")}
        onMouseLeave={e => !isDone && ((e.currentTarget as HTMLButtonElement).style.color = isOverdue ? "var(--color-danger)" : "var(--text-muted)")}
      >
        {isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "var(--text-base)",
            fontWeight: 500,
            color: isDone ? "var(--text-muted)" : isOverdue ? "var(--color-danger)" : "var(--text-primary)",
            textDecoration: isDone ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {task.title}
        </div>
        {task.description && !isDone && (
          <div style={{
            fontSize: "var(--text-xs)", color: "var(--text-secondary)",
            marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {task.description}
          </div>
        )}

        {/* Tags row */}
        {task.tags && task.tags.length > 0 && (
          <div style={{ display: "flex", gap: "var(--space-1)", marginTop: "var(--space-1)", flexWrap: "wrap" }}>
            {task.tags.map(tag => (
              <span
                key={tag.id}
                style={{
                  padding: "1px 6px", borderRadius: "var(--radius-full)",
                  fontSize: 10, background: "var(--bg-overlay)", color: "var(--text-secondary)",
                  display: "flex", alignItems: "center", gap: 3,
                }}
              >
                <Tag size={8} />
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metadata + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
        {/* Overdue Badge */}
        {isOverdue && (
          <span style={{
            display: "flex", alignItems: "center", gap: 3,
            padding: "2px 7px", borderRadius: "var(--radius-full)",
            fontSize: 10, fontWeight: 600,
            color: "var(--color-danger)",
            background: "rgba(239,68,68,0.1)",
          }}>
            <AlertTriangle size={9} />
            Quá hạn
          </span>
        )}

        {/* Priority badge */}
        <span style={{
          padding: "2px 8px", borderRadius: "var(--radius-full)",
          fontSize: 10, fontWeight: 600,
          color: pri.color, background: pri.bg,
        }}>
          {pri.label}
        </span>

        {/* Hover actions */}
        <div style={{
          display: "flex", gap: "var(--space-1)",
          opacity: showActions ? 1 : 0,
          transition: "opacity 150ms ease",
        }}>
          <button
            onClick={() => onEdit(task)}
            style={{
              padding: "var(--space-1) var(--space-2)",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex", alignItems: "center",
              transition: "all 150ms ease",
            }}
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{
              padding: "var(--space-1) var(--space-2)",
              borderRadius: "var(--radius-sm)",
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "var(--color-danger)",
              cursor: "pointer",
              display: "flex", alignItems: "center",
              transition: "all 150ms ease",
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TasksPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("");
  const { data, isLoading } = useTasks(filterStatus ? { status: filterStatus } : {});
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const allTasks = data?.data || [];
  // Calculate counts for each filter (using all tasks)
  const { data: allData } = useTasks({});
  const allItems = allData?.data || [];
  const pendingCount = allItems.filter(t => t.status !== "done").length;
  const doneCount = allItems.filter(t => t.status === "done").length;

  const handleCreateOrUpdate = (payload: any) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data: payload }, {
        onSuccess: () => { setIsModalOpen(false); setEditingTask(null); },
      });
    } else {
      createTask.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa nhiệm vụ này?")) {
      deleteTask.mutate(id);
    }
  };

  const handleToggle = (task: Task) => {
    if (task.status === "done") {
      uncompleteTask.mutate(task.id);
    } else {
      completeTask.mutate(task.id);
    }
  };

  const filters: Array<{ label: string; value: FilterStatus; count: number }> = [
    { label: "Tất cả",    value: "",         count: allItems.length },
    { label: "Chưa xong", value: "pending",  count: pendingCount },
    { label: "Đã xong",   value: "done",     count: doneCount },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "var(--space-4) var(--space-5)",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
      }}>
        {/* Filter pills */}
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              style={{
                display: "flex", alignItems: "center", gap: "var(--space-2)",
                padding: "0 var(--space-3)", height: 32,
                borderRadius: "var(--radius-full)",
                border: filterStatus === f.value
                  ? "1px solid var(--accent-primary)"
                  : "1px solid var(--border-subtle)",
                background: filterStatus === f.value ? "var(--accent-subtle)" : "transparent",
                color: filterStatus === f.value ? "var(--accent-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
                fontWeight: filterStatus === f.value ? 600 : 400,
                transition: "all 150ms ease",
              }}
            >
              {f.label}
              <span style={{
                minWidth: 18, height: 18,
                borderRadius: "var(--radius-full)",
                background: filterStatus === f.value ? "var(--accent-primary)" : "var(--bg-elevated)",
                color: filterStatus === f.value ? "white" : "var(--text-muted)",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
        >
          Thêm Task
        </Button>
      </div>

      {/* Task list */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : allTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={48} />}
          title="Không có nhiệm vụ nào"
          description={filterStatus === "done"
            ? "Bạn chưa hoàn thành nhiệm vụ nào."
            : "Thêm nhiệm vụ mới để bắt đầu."}
          action={filterStatus === ""
            ? { label: "+ Thêm nhiệm vụ", onClick: () => setIsModalOpen(true) }
            : undefined}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {allTasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              task={task}
              index={idx}
              onEdit={t => { setEditingTask(t); setIsModalOpen(true); }}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
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
