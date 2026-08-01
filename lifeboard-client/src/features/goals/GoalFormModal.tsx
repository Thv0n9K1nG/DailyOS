import React, { useState, useEffect } from "react";
import {
  Target, Calendar, Hash, AlignLeft, TrendingUp,
  CheckCircle, PauseCircle, Sparkles,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Goal, CreateGoalPayload, UpdateGoalPayload } from "./api/goalApi";

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGoalPayload | UpdateGoalPayload, id?: number) => void;
  editingGoal?: Goal | null;
  isLoading?: boolean;
}

const UNIT_PRESETS = [
  "cuốn sách", "km", "giờ", "phút", "bài", "trang", "buổi", "lần", "%",
];

const STATUS_OPTIONS = [
  { value: "active",    label: "Đang thực hiện", icon: <TrendingUp size={13} />,   color: "var(--accent-primary)" },
  { value: "paused",    label: "Tạm dừng",        icon: <PauseCircle size={13} />,  color: "var(--color-warning)" },
  { value: "completed", label: "Hoàn thành",       icon: <CheckCircle size={13} />, color: "var(--color-success)" },
];

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen, onClose, onSubmit, editingGoal, isLoading,
}) => {
  const isEdit = !!editingGoal;

  // Form state
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [currentValue, setCurrentValue] = useState<string>("0");
  const [targetValue, setTargetValue]   = useState<string>("100");
  const [unit, setUnit]               = useState("");
  const [deadline, setDeadline]       = useState("");
  const [status, setStatus]           = useState<"active" | "completed" | "paused">("active");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate on edit
  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setTitle(editingGoal.title);
        setDescription(editingGoal.description || "");
        setCurrentValue(String(editingGoal.currentValue));
        setTargetValue(String(editingGoal.targetValue));
        setUnit(editingGoal.unit);
        setDeadline(editingGoal.deadline ? editingGoal.deadline.split("T")[0] : "");
        setStatus(editingGoal.status);
      } else {
        setTitle(""); setDescription(""); setCurrentValue("0"); setTargetValue("100");
        setUnit(""); setDeadline(""); setStatus("active");
      }
      setErrors({});
    }
  }, [isOpen, editingGoal]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Tên mục tiêu không được để trống.";
    if (title.trim().length > 255) errs.title = "Tên tối đa 255 ký tự.";
    if (!unit.trim()) errs.unit = "Đơn vị không được để trống.";
    const tv = parseFloat(targetValue);
    const cv = parseFloat(currentValue);
    if (isNaN(tv) || tv <= 0) errs.targetValue = "Mục tiêu phải lớn hơn 0.";
    if (isNaN(cv) || cv < 0) errs.currentValue = "Giá trị hiện tại không được âm.";
    if (!isNaN(tv) && !isNaN(cv) && cv > tv * 10)
      errs.currentValue = "Giá trị hiện tại vượt quá xa mục tiêu.";
    if (deadline) {
      const d = new Date(deadline);
      if (isNaN(d.getTime())) errs.deadline = "Ngày không hợp lệ.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tv = parseFloat(targetValue);
    const cv = parseFloat(currentValue);

    if (isEdit && editingGoal) {
      const payload: UpdateGoalPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        currentValue: cv,
        targetValue: tv,
        unit: unit.trim(),
        deadline: deadline ? new Date(deadline + "T00:00:00").toISOString() : undefined,
        status,
      };
      onSubmit(payload, editingGoal.id);
    } else {
      const payload: CreateGoalPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        currentValue: cv,
        targetValue: tv,
        unit: unit.trim(),
        deadline: deadline ? new Date(deadline + "T00:00:00").toISOString() : undefined,
      };
      onSubmit(payload);
    }
  };

  const pct = (() => {
    const tv = parseFloat(targetValue);
    const cv = parseFloat(currentValue);
    if (isNaN(tv) || tv <= 0 || isNaN(cv)) return 0;
    return Math.min(100, Math.round((cv / tv) * 100));
  })();

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa mục tiêu" : "Tạo mục tiêu mới"}
      maxWidth={560}
    >
      <form onSubmit={handleSubmit}>
        {/* Live Preview Bar */}
        {(parseFloat(targetValue) > 0) && (
          <div style={{
            padding: "var(--space-3) var(--space-4)",
            background: "var(--bg-overlay)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-5)",
            border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                {title.trim() || "Mục tiêu của bạn"}
              </span>
              <span style={{
                fontSize: "var(--text-xs)", fontWeight: 700,
                color: pct >= 100 ? "var(--color-success)" : "var(--accent-primary)",
              }}>
                {pct}%
              </span>
            </div>
            <div style={{ background: "var(--bg-base)", borderRadius: "var(--radius-full)", height: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: pct >= 100
                  ? "var(--color-success)"
                  : "linear-gradient(90deg, var(--accent-primary), var(--color-info))",
                borderRadius: "var(--radius-full)",
                transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
              }} />
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
              {currentValue || "0"} / {targetValue || "?"} {unit || "đơn vị"}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Title */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
              <Target size={14} style={{ color: "var(--accent-primary)" }} />
              Tên mục tiêu <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <Input
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: "" })); }}
              placeholder="Ví dụ: Đọc 12 cuốn sách trong năm nay..."
              style={{ borderColor: errors.title ? "var(--color-danger)" : undefined }}
            />
            {errors.title && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: 4 }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
              <AlignLeft size={14} style={{ color: "var(--text-muted)" }} />
              Mô tả
            </label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả thêm chi tiết..."
            />
          </div>

          {/* Current / Target / Unit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
                Hiện tại
              </label>
              <Input
                type="number"
                min={0}
                step="any"
                value={currentValue}
                onChange={e => { setCurrentValue(e.target.value); setErrors(p => ({ ...p, currentValue: "" })); }}
                style={{ borderColor: errors.currentValue ? "var(--color-danger)" : undefined }}
              />
              {errors.currentValue && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: 4 }}>{errors.currentValue}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
                Mục tiêu <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <Input
                type="number"
                min={1}
                step="any"
                value={targetValue}
                onChange={e => { setTargetValue(e.target.value); setErrors(p => ({ ...p, targetValue: "" })); }}
                style={{ borderColor: errors.targetValue ? "var(--color-danger)" : undefined }}
              />
              {errors.targetValue && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: 4 }}>{errors.targetValue}</p>}
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
                <Hash size={12} />
                Đơn vị <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <Input
                value={unit}
                onChange={e => { setUnit(e.target.value); setErrors(p => ({ ...p, unit: "" })); }}
                placeholder="km, cuốn..."
                list="unit-presets"
                style={{ borderColor: errors.unit ? "var(--color-danger)" : undefined }}
              />
              <datalist id="unit-presets">
                {UNIT_PRESETS.map(u => <option key={u} value={u} />)}
              </datalist>
              {errors.unit && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: 4 }}>{errors.unit}</p>}
            </div>
          </div>

          {/* Deadline + Status (edit only) */}
          <div style={{ display: "grid", gridTemplateColumns: isEdit ? "1fr 1fr" : "1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
                <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                Hạn chót
              </label>
              <Input
                type="date"
                value={deadline}
                min={!isEdit ? todayStr : undefined}
                onChange={e => { setDeadline(e.target.value); setErrors(p => ({ ...p, deadline: "" })); }}
                style={{ borderColor: errors.deadline ? "var(--color-danger)" : undefined }}
              />
              {deadline && !isEdit && new Date(deadline) < new Date(todayStr) && (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-warning)", marginTop: 4 }}>
                  ⚠ Deadline đã qua — hãy chọn ngày trong tương lai.
                </p>
              )}
              {errors.deadline && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: 4 }}>{errors.deadline}</p>}
            </div>

            {isEdit && (
              <div>
                <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
                  Trạng thái
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value as typeof status)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "var(--space-2) var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border: status === opt.value ? `1px solid ${opt.color}` : "1px solid var(--border-subtle)",
                        background: status === opt.value ? `${opt.color}18` : "var(--bg-base)",
                        color: status === opt.value ? opt.color : "var(--text-secondary)",
                        cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: 500,
                        transition: "all 150ms ease",
                      }}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-6)" }}>
          <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {isEdit ? <><Sparkles size={14} /> Lưu thay đổi</> : <><Target size={14} /> Tạo mục tiêu</>}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
