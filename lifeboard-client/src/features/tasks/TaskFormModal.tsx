import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { CreateTaskPayload, Task } from "./api/taskApi";
import { Clock, Calendar, Flame, Zap, ShieldCheck } from "lucide-react";
import { getTodayInTz, fmtDeadlineTime } from "../../stores/timezoneStore";

const taskSchema = z.object({
  title: z.string().min(1, "Tên nhiệm vụ không được để trống").max(255),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  plannedDate: z.string().optional(),
  hasDeadline: z.boolean().optional(),
  deadlineTime: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskPayload) => void;
  initialData?: Task | null;
  defaultDate?: string;
  isLoading?: boolean;
}

const PRIORITIES: Array<{
  value: "low" | "medium" | "high";
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}> = [
  { value: "low",    label: "Thấp", color: "var(--priority-low)",    bg: "rgba(82,215,191,0.12)", icon: <ShieldCheck size={14} /> },
  { value: "medium", label: "Vừa",  color: "var(--priority-medium)", bg: "rgba(255,179,71,0.12)",  icon: <Zap size={14} /> },
  { value: "high",   label: "Cao",  color: "var(--priority-high)",   bg: "rgba(248,113,113,0.12)", icon: <Flame size={14} /> },
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen, onClose, onSubmit, initialData, defaultDate, isLoading,
}) => {
  const effectiveDefaultDate = defaultDate || getTodayInTz();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      plannedDate: effectiveDefaultDate,
      hasDeadline: true,
      deadlineTime: "23:59",
    },
  });

  const watchHasDeadline = watch("hasDeadline");
  const watchPlannedDate  = watch("plannedDate");
  const watchDeadlineTime = watch("deadlineTime");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const pDate = initialData.plannedDate ? initialData.plannedDate.split("T")[0] : effectiveDefaultDate;
        const existDeadlineTime = initialData.deadline ? fmtDeadlineTime(initialData.deadline) : "23:59";
        reset({
          title: initialData.title,
          description: initialData.description || "",
          priority: initialData.priority,
          plannedDate: pDate,
          hasDeadline: !!initialData.deadline,
          deadlineTime: existDeadlineTime || "23:59",
        });
      } else {
        reset({
          title: "",
          description: "",
          priority: "medium",
          plannedDate: effectiveDefaultDate,
          hasDeadline: true,
          deadlineTime: "23:59",
        });
      }
    }
  }, [initialData, reset, isOpen, effectiveDefaultDate]);

  const handleFormSubmit = (data: TaskFormData) => {
    const plannedDateStr = data.plannedDate || effectiveDefaultDate;
    
    // Construct ISO Deadline string with 23:59 default
    let deadlineIso: string | undefined = undefined;
    if (data.hasDeadline) {
      const timePart = data.deadlineTime && data.deadlineTime.trim() ? data.deadlineTime.trim() : "23:59";
      // Construct local date time string: YYYY-MM-DDTHH:mm:00
      const localDt = new Date(`${plannedDateStr}T${timePart}:00`);
      if (!isNaN(localDt.getTime())) {
        deadlineIso = localDt.toISOString();
      }
    }

    onSubmit({
      title: data.title,
      description: data.description,
      priority: data.priority,
      plannedDate: plannedDateStr,
      deadline: deadlineIso,
      isRecurring: false,
      tagIds: [],
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
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Tên nhiệm vụ <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <Input
              {...register("title")}
              placeholder="Ví dụ: Hoàn thành báo cáo đồ án..."
              error={errors.title?.message}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Mô tả chi tiết <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 400 }}>(tùy chọn)</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Ghi chú thêm thông tin cho nhiệm vụ..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
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
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
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
                          height: 38,
                          borderRadius: "var(--radius-md)",
                          border: isSelected
                            ? `1.5px solid ${p.color}`
                            : "1px solid var(--border-subtle)",
                          background: isSelected ? p.bg : "var(--bg-overlay)",
                          color: isSelected ? p.color : "var(--text-muted)",
                          fontSize: "var(--text-sm)",
                          fontWeight: isSelected ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 150ms ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: isSelected ? `0 2px 8px ${p.color}30` : "none",
                        }}
                      >
                        {p.icon}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Date & Deadline row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Planned Date */}
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Calendar size={14} /> Ngày thực hiện
              </label>
              <Input type="date" {...register("plannedDate")} />
            </div>

            {/* Deadline Time */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={14} /> Giờ hạn chót
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--accent-primary)", cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    {...register("hasDeadline")}
                    style={{ accentColor: "var(--accent-primary)", cursor: "pointer" }}
                  />
                  Đặt deadline
                </label>
              </div>

              <div style={{ opacity: watchHasDeadline ? 1 : 0.4, pointerEvents: watchHasDeadline ? "auto" : "none", transition: "opacity 150ms" }}>
                <Input
                  type="time"
                  {...register("deadlineTime")}
                  placeholder="23:59"
                />
              </div>
              {watchHasDeadline && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <span>💡 Mặc định: <strong>23:59</strong></span>
                  {!watchDeadlineTime && (
                    <button
                      type="button"
                      onClick={() => setValue("deadlineTime", "23:59")}
                      style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}
                    >
                      Dùng 23:59
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
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

