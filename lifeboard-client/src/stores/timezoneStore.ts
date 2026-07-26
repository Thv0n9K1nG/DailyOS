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
