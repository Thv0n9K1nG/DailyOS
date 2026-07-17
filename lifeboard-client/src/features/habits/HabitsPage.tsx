import React, { useState } from "react";
import { Plus, CheckCircle, Circle, Flame, Edit2, Trash2 } from "lucide-react";
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useCheckinHabit } from "./hooks/useHabits";
import { Habit } from "./api/habitApi";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { HabitFormModal } from "./HabitFormModal";

export const HabitsPage: React.FC = () => {
  const { data: habits, isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const checkinHabit = useCheckinHabit();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const handleCreateOrUpdate = (payload: any) => {
    if (editingHabit) {
      updateHabit.mutate({ id: editingHabit.id, data: payload }, { onSuccess: () => { setIsModalOpen(false); setEditingHabit(null); } });
    } else {
      createHabit.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleCheckin = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    checkinHabit.mutate({ id: habit.id, date: today, isCompleted: !habit.checkedInToday });
  };

  return (
    <div>
      <div className="flex justify-between items-center bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] mb-5">
        <div>
          <h2 className="text-xl font-bold text-[--text-primary] mb-2">Thói quen</h2>
          <p className="text-sm text-[--text-secondary]">Xây dựng chuỗi thói quen hàng ngày.</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}>
          <Plus size={18} /> Thêm Thói quen
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center p-10 text-[--text-muted]">Đang tải...</div>
      ) : !habits || habits.length === 0 ? (
        <EmptyState icon={<Flame size={48} />} title="Chưa có thói quen" description="Tạo một thói quen mới để bắt đầu xây dựng chuỗi ngày liên tiếp." action={{ label: "Thêm ngay", onClick: () => setIsModalOpen(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(habit => (
            <div key={habit.id} className="bg-[--bg-surface] p-5 rounded-[--radius-lg] border border-[--border-subtle] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: habit.color }}></div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[--text-primary]">{habit.name}</h3>
                    <p className="text-xs text-[--text-secondary]">{habit.frequency}</p>
                  </div>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingHabit(habit); setIsModalOpen(true); }} className="p-1 text-[--text-secondary] hover:text-[--text-primary]"><Edit2 size={16} /></button>
                  <button onClick={() => deleteHabit.mutate(habit.id)} className="p-1 text-[--text-secondary] hover:text-[--color-danger]"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: habit.streak > 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                  <Flame size={18} fill={habit.streak > 0 ? "currentColor" : "none"} />
                  {habit.streak} ngày liên tiếp
                </div>
                
                <button 
                  onClick={() => handleCheckin(habit)}
                  className={`p-2 rounded-full transition-all ${habit.checkedInToday ? 'bg-[--color-success] text-white' : 'bg-[--bg-elevated] text-[--text-muted] hover:bg-[--border-default]'}`}
                >
                  {habit.checkedInToday ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HabitFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateOrUpdate} initialData={editingHabit} isLoading={createHabit.isPending || updateHabit.isPending} />
    </div>
  );
};

