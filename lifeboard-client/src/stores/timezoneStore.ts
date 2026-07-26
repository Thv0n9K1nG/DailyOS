/**
 * timezoneStore.ts
 *
 * Quản lý múi giờ người dùng.
 * - Đọc từ localStorage (key: "lifeboard-timezone")
 * - Fallback: "Asia/Ho_Chi_Minh" (UTC+7)
 * - Cung cấp helper getNowInTz() trả về ngày giờ hiện tại theo timezone đã chọn
 */
import { create } from "zustand";

const TZ_KEY = "lifeboard-timezone";
const DEFAULT_TZ = "Asia/Ho_Chi_Minh";

export function getStoredTimezone(): string {
  try {
    return localStorage.getItem(TZ_KEY) || DEFAULT_TZ;
  } catch {
    return DEFAULT_TZ;
  }
}

export function applyTimezone(tz: string): void {
  try {
    localStorage.setItem(TZ_KEY, tz);
  } catch { /* noop */ }
}

/**
 * Trả về ngày hiện tại (YYYY-MM-DD) theo timezone đã chọn.
 */
export function getTodayInTz(tz?: string): string {
  const zone = tz ?? getStoredTimezone();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find(p => p.type === "year")?.value ?? "";
  const m = parts.find(p => p.type === "month")?.value ?? "";
  const d = parts.find(p => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}

/**
 * Trả về một Date object đại diện cho "hôm nay 00:00:00" theo timezone.
 * Dùng để so sánh ngày (overdue check, v.v.)
 */
export function getTodayMidnightInTz(tz?: string): Date {
  const dateStr = getTodayInTz(tz);
  const [y, m, dd] = dateStr.split("-").map(Number);
  const d = new Date();
  d.setFullYear(y, m - 1, dd);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format thời gian hiện tại theo timezone để hiển thị.
 */
export function fmtNowInTz(tz?: string): string {
  const zone = tz ?? getStoredTimezone();
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

/**
 * Format deadline ISO string sang HH:mm (hoặc HH:mm - DD/MM) theo timezone.
 */
export function fmtDeadlineTime(isoStr?: string, tz?: string): string {
  if (!isoStr) return "";
  const zone = tz ?? getStoredTimezone();
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(isoStr) ? isoStr : isoStr + "Z";
  const dt = new Date(normalized);
  if (isNaN(dt.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dt);
}

export interface DeadlineInfo {
  status: "overdue" | "due_soon" | "normal" | "none";
  label: string;
  timeStr: string;
}

/**
 * Tính toán trạng thái Deadline cho một task dựa trên timezone của user:
 * - overdue: Đã quá deadline
 * - due_soon: Còn dưới 2 tiếng
 * - normal: Đã set deadline và còn đủ thời gian
 * - none: Không có deadline
 */
export function getDeadlineInfo(deadlineIsoStr?: string, isDone?: boolean, tz?: string): DeadlineInfo {
  if (!deadlineIsoStr || isDone) {
    return { status: "none", label: "", timeStr: "" };
  }

  const zone = tz ?? getStoredTimezone();
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(deadlineIsoStr) ? deadlineIsoStr : deadlineIsoStr + "Z";
  const deadlineDt = new Date(normalized);
  if (isNaN(deadlineDt.getTime())) {
    return { status: "none", label: "", timeStr: "" };
  }

  const now = new Date();
  const diffMs = deadlineDt.getTime() - now.getTime();
  const timeStr = fmtDeadlineTime(deadlineIsoStr, zone);

  if (diffMs < 0) {
    return { status: "overdue", label: `Quá hạn (${timeStr})`, timeStr };
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes <= 120) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const remainingText = hours > 0 ? `Còn ${hours}h ${mins}p` : `Còn ${mins}p`;
    return { status: "due_soon", label: `${remainingText} (${timeStr})`, timeStr };
  }

  return { status: "normal", label: `Hạn chót: ${timeStr}`, timeStr };
}

interface TimezoneStore {
  timezone: string;
  setTimezone: (tz: string) => void;
}

export const useTimezoneStore = create<TimezoneStore>((set) => ({
  timezone: getStoredTimezone(),
  setTimezone: (tz: string) => {
    applyTimezone(tz);
    set({ timezone: tz });
  },
}));

