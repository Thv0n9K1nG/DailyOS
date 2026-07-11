import { format, parseISO, isToday, isTomorrow, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";

export const formatDate = (iso: string, fmt = "dd/MM/yyyy") =>
  format(parseISO(iso), fmt, { locale: vi });

export const formatDateTime = (iso: string) =>
  format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: vi });

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}g ${m}p`;
  if (m > 0) return `${m}p ${s}s`;
  return `${s}s`;
};

export const classNames = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

export const toLocalDateString = (date: Date = new Date()) =>
  format(date, "yyyy-MM-dd");

export const daysRemainingLabel = (daysRemaining: number): string => {
  if (daysRemaining > 0) return `Còn ${daysRemaining} ngày`;
  if (daysRemaining === 0) return "Hôm nay!";
  return `Đã qua ${Math.abs(daysRemaining)} ngày`;
};

export const priorityColor: Record<string, string> = {
  high: "var(--priority-high)",
  medium: "var(--priority-medium)",
  low: "var(--priority-low)",
};

export const moodEmojis: Record<number, string> = {
  1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "😄",
};
