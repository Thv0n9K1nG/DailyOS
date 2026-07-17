import React, { useState } from "react";
import { Plus, Trash2, Edit2, Clock } from "lucide-react";
import { useCountdowns, useCreateCountdown, useUpdateCountdown, useDeleteCountdown } from "./hooks/useCountdowns";
import { Countdown } from "./api/countdownApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { daysRemainingLabel } from "@/lib/utils";

export const CountdownPage: React.FC = () => {
  const { data: countdowns, isLoading } = useCountdowns();
  const createCountdown = useCreateCountdown();
  const updateCountdown = useUpdateCountdown();
  const deleteCountdown = useDeleteCountdown();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Countdown | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("📅");
  const [color, setColor] = useState("#3D8EF0");

  const handleOpenModal = (item: Countdown | null = null) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      setTargetDate(item.targetDate.split('T')[0]);
      setIcon(item.icon || "📅");
      setColor(item.color || "#3D8EF0");
    } else {
      setEditingItem(null);
      setTitle("");
      setTargetDate(new Date().toISOString().split('T')[0]);
      setIcon("📅");
      setColor("#3D8EF0");
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetDate) return;

    const payload = { title, targetDate: new Date(targetDate).toISOString(), icon, color };

    if (editingItem) {
      updateCountdown.mutate({ id: editingItem.id, data: payload }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createCountdown.mutate(payload, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa sự kiện đếm ngược này?")) {
      deleteCountdown.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] mb-5">
        <div>
          <h2 className="text-xl font-bold text-[--text-primary] mb-2">Đếm ngược sự kiện</h2>
          <p className="text-sm text-[--text-secondary]">Theo dõi số ngày còn lại đến các sự kiện quan trọng.</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal(null)}>
          <Plus size={18} /> Thêm Sự kiện
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center p-10 text-[--text-muted]">Đang tải...</div>
      ) : !countdowns || countdowns.length === 0 ? (
        <EmptyState 
          icon={<Clock size={48} />} 
          title="Chưa có sự kiện nào" 
          description="Lên danh sách ngày đếm ngược đến Deadline, sinh nhật, hoặc các sự kiện đặc biệt." 
          action={{ label: "Thêm sự kiện", onClick: () => handleOpenModal(null) }} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countdowns.map(c => {
            const diff = c.daysRemaining;
            const label = daysRemainingLabel(diff);
            return (
              <div key={c.id} className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: c.color }}></div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.icon || "⏳"}</span>
                    <div>
                      <h3 className="font-semibold text-[--text-primary]">{c.title}</h3>
                      <p className="text-xs text-[--text-secondary]">Ngày mục tiêu: {new Date(c.targetDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(c)} className="p-1 text-[--text-secondary] hover:text-[--text-primary]" style={{ background: "none", border: "none", cursor: "pointer" }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1 text-[--text-secondary] hover:text-[--color-danger]" style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="mt-5 text-right">
                  <span className="text-2xl font-bold" style={{ color: diff <= 3 && diff >= 0 ? "var(--color-danger)" : "var(--accent-primary)" }}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Sửa sự kiện" : "Thêm sự kiện mới"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên sự kiện *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tết Nguyên Đán, Deadline bài tập..." required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày diễn ra *</label>
            <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Emoji / Icon</label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="📅" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Màu sắc</label>
              <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 p-1" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={createCountdown.isPending || updateCountdown.isPending}>Lưu sự kiện</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
