import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save } from "lucide-react";
import { useSettings, useUpdateSettings } from "./hooks/useSettings";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const settingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  pomodoroFocusMinutes: z.number().min(1).max(120),
  pomodoroBreakMinutes: z.number().min(1).max(60),
  pomodoroRounds: z.number().min(1).max(10),
  habitGracePeriodDays: z.number().min(0).max(7),
  language: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const SettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormData) => {
    updateSettings.mutate(data, {
      onSuccess: () => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', data.theme);
      }
    });
  };

  if (isLoading) return <div className="p-10 text-center">Đang tải cấu hình...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] mb-6">
        <h2 className="text-xl font-bold text-[--text-primary] mb-2">Cấu hình hệ thống</h2>
        <p className="text-sm text-[--text-secondary]">Tùy chỉnh LifeBoard theo cách bạn muốn.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] space-y-4">
          <h3 className="font-semibold text-lg border-b border-[--border-subtle] pb-2 mb-4">Giao diện & Ngôn ngữ</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Giao diện (Theme)</label>
              <select {...register("theme")} className="w-full bg-[--bg-base] border border-[--border-default] rounded-[--radius-md] p-2 text-[--text-primary]">
                <option value="light">Sáng (Light)</option>
                <option value="dark">Tối (Dark)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngôn ngữ</label>
              <select {...register("language")} className="w-full bg-[--bg-base] border border-[--border-default] rounded-[--radius-md] p-2 text-[--text-primary]">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[--bg-surface] p-6 rounded-[--radius-lg] border border-[--border-subtle] space-y-4">
          <h3 className="font-semibold text-lg border-b border-[--border-subtle] pb-2 mb-4">Pomodoro Timer</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian Focus (phút)</label>
              <Input type="number" {...register("pomodoroFocusMinutes", { valueAsNumber: true })} error={errors.pomodoroFocusMinutes?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian nghỉ (phút)</label>
              <Input type="number" {...register("pomodoroBreakMinutes", { valueAsNumber: true })} error={errors.pomodoroBreakMinutes?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số vòng lặp (Rounds)</label>
              <Input type="number" {...register("pomodoroRounds", { valueAsNumber: true })} error={errors.pomodoroRounds?.message} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={updateSettings.isPending} leftIcon={<Save size={18} />}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
};
