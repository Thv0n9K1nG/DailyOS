import React, { useState } from "react";
import { Target, Plus, Trash2, Edit2, TrendingUp, CheckCircle, PauseCircle } from "lucide-react";
import { useGoals, useCreateGoal, useUpdateGoal, useUpdateGoalProgress, useDeleteGoal } from "./hooks/useGoals";
import { Goal, CreateGoalPayload, UpdateGoalPayload } from "./api/goalApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";

const statusConfig = {
  active: { label: "Đang thực hiện", color: "var(--accent-primary)", icon: <TrendingUp size={14} /> },
  completed: { label: "Hoàn thành", color: "var(--color-success)", icon: <CheckCircle size={14} /> },
  paused: { label: "Tạm dừng", color: "var(--color-warning)", icon: <PauseCircle size={14} /> },
};

export const GoalsPage: React.FC = () => {
  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const updateProgress = useUpdateGoalProgress();
  const deleteGoal = useDeleteGoal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentValue, setCurrentValue] = useState(0);
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"active" | "completed" | "paused">("active");

  // Progress state
  const [newProgress, setNewProgress] = useState(0);

  const resetForm = () => {
    setTitle(""); setDescription(""); setCurrentValue(0);
    setTargetValue(100); setUnit(""); setDeadline(""); setStatus("active");
  };

  const handleOpenCreate = () => {
    setEditingGoal(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || "");
    setCurrentValue(goal.currentValue);
    setTargetValue(goal.targetValue);
    setUnit(goal.unit);
    setDeadline(goal.deadline ? goal.deadline.split('T')[0] : "");
    setStatus(goal.status);
    setIsModalOpen(true);
  };

  const handleOpenProgress = (goal: Goal) => {
    setProgressGoal(goal);
    setNewProgress(goal.currentValue);
    setIsProgressOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !unit || targetValue <= 0) return;

    if (editingGoal) {
      const payload: UpdateGoalPayload = { title, description, currentValue, targetValue, unit, status,
        deadline: deadline ? new Date(deadline).toISOString() : undefined };
      updateGoal.mutate({ id: editingGoal.id, data: payload }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      const payload: CreateGoalPayload = { title, description, currentValue, targetValue, unit,
        deadline: deadline ? new Date(deadline).toISOString() : undefined };
      createGoal.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressGoal) return;
    updateProgress.mutate({ id: progressGoal.id, currentValue: newProgress },
      { onSuccess: () => setIsProgressOpen(false) });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa mục tiêu này?")) {
      deleteGoal.mutate(id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] mb-5">
        <div>
          <h2 className="text-xl font-bold text-[--text-primary] mb-2">Mục tiêu dài hạn</h2>
          <p className="text-sm text-[--text-secondary]">Theo dõi tiến độ hướng đến những mục tiêu lớn của bạn.</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus size={18} /> Thêm mục tiêu
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center p-10 text-[--text-muted]">Đang tải mục tiêu...</div>
      ) : !goals || goals.length === 0 ? (
        <EmptyState
          icon={<Target size={48} />}
          title="Chưa có mục tiêu nào"
          description="Đặt mục tiêu dài hạn và theo dõi tiến trình từng bước nhỏ mỗi ngày."
          action={{ label: "Tạo mục tiêu đầu tiên", onClick: handleOpenCreate }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map(goal => {
            const cfg = statusConfig[goal.status] || statusConfig.active;
            const pct = Math.min(100, Math.round(goal.progressPercent));
            return (
              <div key={goal.id}
                className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle] group hover:border-[--accent-primary] transition-all"
                style={{ animation: "slideUp 0.3s ease" }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[--text-primary]">{goal.title}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: `${cfg.color}22`, color: cfg.color }}>
                        {cfg.icon}{cfg.label}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-[--text-muted] mb-2">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button onClick={() => handleOpenEdit(goal)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(goal.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", padding: "4px" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span className="text-xs text-[--text-muted]">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="text-xs font-bold" style={{ color: pct >= 100 ? "var(--color-success)" : "var(--accent-primary)" }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ background: "var(--bg-overlay)", borderRadius: "var(--radius-full)", height: "8px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: pct >= 100 ? "var(--color-success)" : "var(--accent-primary)",
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                    }} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {goal.deadline ? (
                    <span className="text-xs text-[--text-muted]">
                      🎯 {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                    </span>
                  ) : <span />}
                  <Button size="sm" variant="secondary" onClick={() => handleOpenProgress(goal)}>
                    Cập nhật tiến độ
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGoal ? "Sửa mục tiêu" : "Thêm mục tiêu mới"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên mục tiêu *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Chạy bộ 100km, Đọc 20 cuốn sách..." required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả chi tiết mục tiêu..." />
          </div>
          <div className="grid grid-cols-3" style={{ gap: "12px" }}>
            <div>
              <label className="block text-sm font-medium mb-1">Hiện tại</label>
              <Input type="number" min={0} value={currentValue} onChange={e => setCurrentValue(+e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mục tiêu *</label>
              <Input type="number" min={1} value={targetValue} onChange={e => setTargetValue(+e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đơn vị *</label>
              <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="km, cuốn..." required />
            </div>
          </div>
          <div className="grid grid-cols-2" style={{ gap: "12px" }}>
            <div>
              <label className="block text-sm font-medium mb-1">Hạn chót</label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            {editingGoal && (
              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value as typeof status)}>
                  <option value="active">Đang thực hiện</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="paused">Tạm dừng</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2" style={{ marginTop: "24px" }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={createGoal.isPending || updateGoal.isPending}>
              Lưu mục tiêu
            </Button>
          </div>
        </form>
      </Modal>

      {/* Progress Modal */}
      <Modal isOpen={isProgressOpen} onClose={() => setIsProgressOpen(false)} title={`Cập nhật tiến độ — ${progressGoal?.title}`}>
        <form onSubmit={handleSaveProgress} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá trị hiện tại ({progressGoal?.unit})
            </label>
            <Input type="number" min={0} max={progressGoal?.targetValue}
              value={newProgress} onChange={e => setNewProgress(+e.target.value)} />
            <div style={{ marginTop: "12px" }}>
              <input type="range" min={0} max={progressGoal?.targetValue || 100} step={0.5}
                value={newProgress} onChange={e => setNewProgress(+e.target.value)}
                style={{ width: "100%", accentColor: "var(--accent-primary)" }} />
            </div>
            <div className="flex justify-between text-xs text-[--text-muted]" style={{ marginTop: "4px" }}>
              <span>0 {progressGoal?.unit}</span>
              <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                {Math.min(100, Math.round((newProgress / (progressGoal?.targetValue || 1)) * 100))}%
              </span>
              <span>{progressGoal?.targetValue} {progressGoal?.unit}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2" style={{ marginTop: "24px" }}>
            <Button type="button" variant="ghost" onClick={() => setIsProgressOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={updateProgress.isPending}>Lưu tiến độ</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

