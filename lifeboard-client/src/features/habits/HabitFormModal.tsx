import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { CreateHabitPayload, Habit } from "./api/habitApi";

const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  icon: z.string(),
  color: z.string(),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHabitPayload) => void;
  initialData?: Habit | null;
  isLoading?: boolean;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: { name: "", description: "", frequency: "daily", icon: "📌", color: "#3D8EF0" }
  });

  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name, description: initialData.description || "", frequency: initialData.frequency, icon: initialData.icon, color: initialData.color });
    } else {
      reset({ name: "", description: "", frequency: "daily", icon: "📌", color: "#3D8EF0" });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Sửa thói quen" : "Thêm thói quen mới"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên thói quen *</label>
          <Input {...register("name")} placeholder="Đọc sách..." error={errors.name?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <Input {...register("description")} placeholder="Mỗi ngày 20 trang..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tần suất</label>
            <select {...register("frequency")} className="w-full bg-[--bg-base] border border-[--border-default] rounded-md p-2 text-[--text-primary]">
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
              <option value="monthly">Hàng tháng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Màu sắc</label>
            <Input type="color" {...register("color")} className="h-10 p-1" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary" loading={isLoading}>Lưu</Button>
        </div>
      </form>
    </Modal>
  );
};
