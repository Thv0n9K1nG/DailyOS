import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { CreateTaskPayload, Task } from "./api/taskApi";

const taskSchema = z.object({
  title: z.string().min(1, "Tên nhiệm vụ không được để trống").max(255),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string().optional(),
  plannedDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskPayload) => void;
  initialData?: Task | null;
  isLoading?: boolean;
}

const PRIORITIES: Array<{ value: "low" | "medium" | "high"; label: string; color: string; bg: string }> = [
  { value: "low",    label: "Thấp", color: "var(--priority-low)",    bg: "rgba(82,215,191,0.12)" },
  { value: "medium", label: "Vừa",  color: "var(--priority-medium)", bg: "rgba(255,179,71,0.12)" },
  { value: "high",   label: "Cao",  color: "var(--priority-high)",   bg: "rgba(248,113,113,0.12)" },
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen, onClose, onSubmit, initialData, isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      deadline: "",
      plannedDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || "",
        priority: initialData.priority,
        deadline: initialData.deadline?.split("T")[0] || "",
        plannedDate: initialData.plannedDate?.split("T")[0] || "",
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: "medium",
        deadline: "",
        plannedDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({
      ...data,
      isRecurring: false,
      tagIds: [],
      plannedDate: data.plannedDate ? new Date(data.plannedDate).toISOString() : undefined,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Chỉnh sửa nhiệm vụ" : "Thêm nhiệm vụ mới"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

          {/* Title */}
          <div>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: "var(--space-1)" }}>
              Tên nhiệm vụ <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <Input
              {...register("title")}
              placeholder="Ví dụ: Học React hooks..."
              error={errors.title?.message}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: "var(--space-1)" }}>
              Mô tả <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 400 }}>(tùy chọn)</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Ghi chi tiết về nhiệm vụ..."
              rows={2}
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "var(--text-base)",
                outline: "none",
                resize: "vertical",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.5,
                transition: "border-color 150ms ease",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
            />
          </div>

          {/* Priority button group */}
          <div>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: "var(--space-2)" }}>
              Mức độ ưu tiên
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  {PRIORITIES.map(p => {
                    const isSelected = field.value === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => field.onChange(p.value)}
                        style={{
                          flex: 1,
                          height: 36,
                          borderRadius: "var(--radius-md)",
                          border: isSelected
                            ? `1.5px solid ${p.color}`
                            : "1px solid var(--border-subtle)",
                          background: isSelected ? p.bg : "transparent",
                          color: isSelected ? p.color : "var(--text-muted)",
                          fontSize: "var(--text-sm)",
                          fontWeight: isSelected ? 700 : 400,
                          cursor: "pointer",
                          transition: "all 150ms ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "var(--space-1)",
                        }}
                      >
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: isSelected ? p.color : "var(--text-muted)",
                          flexShrink: 0,
                        }} />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Date row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: "var(--space-1)" }}>
                Ngày dự kiến
              </label>
              <Input type="date" {...register("plannedDate")} />
            </div>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: "var(--space-1)" }}>
                Hạn chót
              </label>
              <Input type="date" {...register("deadline")} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              {initialData ? "Lưu thay đổi" : "Tạo nhiệm vụ"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
