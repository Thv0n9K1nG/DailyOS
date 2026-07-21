import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import { Plus, Trash2, Edit2, Clock, Tag } from "lucide-react";
import { useCountdowns, useCreateCountdown, useUpdateCountdown, useDeleteCountdown } from "./hooks/useCountdowns";
import { Countdown } from "./api/countdownApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";

// ── Pure frontend date math — no backend, no timezone ─────────────────────────

/** Parse "yyyy-MM-dd" string to local Date (no UTC offset issue) */
function parseDateOnly(s: string): Date {
  const parts = s.split("-");
  const dt = new Date();
  dt.setFullYear(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  dt.setHours(0, 0, 0, 0);
  return dt;
}

/** Compute days remaining from "yyyy-MM-dd" string vs today */
function calcDaysRemaining(targetStr: string): number {
  const target = parseDateOnly(targetStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Format days for display */
function fmtDays(days: number): string {
  if (days === 0) return "Hôm nay!";
  if (days === 1) return "Ngày mai";
  if (days < 0) return `Đã qua ${Math.abs(days)} ngày`;
  return `${days} ngày`;
}

/** Format date for display as dd/MM/yyyy */
function fmtDate(s: string): string {
  const parts = s.split("-");
  if (parts.length !== 3) return s;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/** Today's date as "yyyy-MM-dd" */
function todayStr(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Emoji Picker ──────────────────────────────────────────────────────────────
const EMOJIS = [
  "📅","🗓️","🎯","🏆","🎊","🎉","🎂","🥂","🎁","🎗️",
  "📚","📖","✏️","💻","📋","📝","📌","🗂️","⌨️","🖥️",
  "💪","🏃","🧘","🏋️","⚽","🏀","🎾","🚴","🏊","🤸",
  "✈️","🚀","🌍","🏖️","🏔️","🗺️","🚂","🛳️","🚗","🏠",
  "💰","💵","💳","📈","🪙","💎","🏦","💹","🤑","🧾",
  "🌟","⭐","🌙","☀️","🌈","🍀","🌸","🔥","⚡","💥",
  "⏰","⏳","🕐","⌚","🕰️","📆","🔔","📉","📊","🗑️",
  "🎮","🎲","🎸","🎵","🎬","📷","🦋","🐉","🦄","👑",
];

const EmojiPicker = ({ value, onChange }: { value: string; onChange: (e: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 300 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 300) });
    }
    setOpen(o => !o);
  };

  const dropdown = open && (
    <div ref={dropRef} style={{
      position: "fixed",
      top: dropdownPos.top,
      left: dropdownPos.left,
      width: dropdownPos.width,
      zIndex: 9999,
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      padding: 12,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 4, maxHeight: 220, overflowY: "auto" }}>
        {EMOJIS.map(em => (
          <button key={em} type="button" onClick={() => { onChange(em); setOpen(false); }}
            style={{
              background: value === em ? "rgba(61,142,240,0.2)" : "transparent",
              border: value === em ? "1px solid var(--accent-primary)" : "1px solid transparent",
              borderRadius: 6, cursor: "pointer", fontSize: 20, padding: "3px 1px",
            }}>{em}</button>
        ))}
      </div>
      <div style={{ marginTop: 8, borderTop: "1px solid var(--border-subtle)", paddingTop: 8 }}>
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder="Hoặc nhập emoji tùy chỉnh…" maxLength={4}
          style={{
            width: "100%", background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
            padding: "5px 8px", fontSize: 16, outline: "none", boxSizing: "border-box",
          }} />
      </div>
    </div>
  );

  return (
    <>
      <button ref={btnRef} type="button" onClick={handleOpen} style={{
        width: "100%", padding: "8px 12px", background: "var(--bg-overlay)",
        border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
        fontSize: 14, color: "var(--text-primary)",
      }}>
        <span style={{ fontSize: 22 }}>{value}</span>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Bấm để chọn emoji…</span>
      </button>
      {typeof document !== "undefined" && ReactDOM.createPortal(dropdown, document.body)}
    </>
  );
};



// ── Live countdown hook — ticks every second ──────────────────────────────────
function useLiveDays(targetDateStr: string): number {
  const [days, setDays] = useState(() => calcDaysRemaining(targetDateStr));
  useEffect(() => {
    setDays(calcDaysRemaining(targetDateStr));
    // Recalculate at midnight and also every minute (in case date changes)
    const id = setInterval(() => setDays(calcDaysRemaining(targetDateStr)), 60_000);
    return () => clearInterval(id);
  }, [targetDateStr]);
  return days;
}

// ── Single countdown card ─────────────────────────────────────────────────────
const CountdownCard = ({
  c,
  onEdit,
  onDelete,
}: {
  c: Countdown;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const days = useLiveDays(c.targetDate);
  const isPast = days < 0;
  const isUrgent = days >= 0 && days <= 7;
  const accentColor = isPast ? "var(--text-muted)" : isUrgent ? "var(--color-danger)" : (c.color || "var(--accent-primary)");

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", overflow: "hidden",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.cssText += "box-shadow:0 4px 20px rgba(0,0,0,0.15);transform:translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
    >
      {/* Top color bar */}
      <div style={{ height: 4, background: c.color || "var(--accent-primary)" }} />

      <div style={{ padding: "16px 16px 14px" }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{c.icon || "⏳"}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                📆 {fmtDate(c.targetDate)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <button onClick={onEdit} title="Sửa" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 5 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"}
            ><Edit2 size={15} /></button>
            <button onClick={onDelete} title="Xóa" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 5 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--color-danger)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"}
            ><Trash2 size={15} /></button>
          </div>
        </div>

        {/* Big days display */}
        <div style={{ textAlign: "center", padding: "10px 0 4px", borderTop: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "monospace", color: accentColor }}>
            {fmtDays(days)}
          </span>
          {isUrgent && !isPast && days > 0 && (
            <div style={{ fontSize: 11, color: "var(--color-danger)", marginTop: 2, fontWeight: 600 }}>⚠️ Sắp đến!</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const CountdownPage: React.FC = () => {
  const { data: countdowns, isLoading } = useCountdowns();
  const createCountdown = useCreateCountdown();
  const updateCountdown = useUpdateCountdown();
  const deleteCountdown = useDeleteCountdown();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Countdown | null>(null);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState(todayStr());
  const [icon, setIcon] = useState("📅");
  const [color, setColor] = useState("#3D8EF0");

  const openModal = (item: Countdown | null = null) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      // targetDate is "yyyy-MM-dd" from backend — use directly
      const dateStr = item.targetDate.split("T")[0];
      const year = parseInt(dateStr.split("-")[0], 10);
      setTargetDate(year >= 2000 ? dateStr : todayStr());
      setIcon(item.icon || "📅");
      setColor(item.color || "#3D8EF0");
    } else {
      setEditingItem(null);
      setTitle("");
      setTargetDate(todayStr());
      setIcon("📅");
      setColor("#3D8EF0");
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;
    // Send targetDate as plain "yyyy-MM-dd" — backend stores as DATE column
    const payload = { title: title.trim(), targetDate, icon, color };
    if (editingItem) {
      updateCountdown.mutate({ id: editingItem.id, data: payload }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createCountdown.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Xóa sự kiện này?")) deleteCountdown.mutate(id);
  };

  // Preview days in modal
  const previewDays = targetDate ? calcDaysRemaining(targetDate) : null;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 20,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Đếm ngược sự kiện</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Theo dõi số ngày còn lại đến các sự kiện quan trọng.</p>
        </div>
        <Button variant="primary" onClick={() => openModal(null)}>
          <Plus size={18} style={{ marginRight: 6 }} /> Thêm sự kiện
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Đang tải...</div>
      ) : !countdowns || countdowns.length === 0 ? (
        <EmptyState icon={<Clock size={48} />} title="Chưa có sự kiện nào"
          description="Thêm sự kiện để đếm ngược đến Deadline, sinh nhật, hay các mốc quan trọng."
          action={{ label: "Thêm sự kiện", onClick: () => openModal(null) }} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {countdowns.map(c => (
            <CountdownCard key={c.id} c={c} onEdit={() => openModal(c)} onDelete={() => handleDelete(c.id)} />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Sửa sự kiện" : "Thêm sự kiện mới"}>
        <form onSubmit={handleSave}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Tên sự kiện *</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tết Nguyên Đán, Deadline dự án..." required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Ngày diễn ra *</label>
              <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
              {/* Live preview */}
              {targetDate && previewDays !== null && (
                <div style={{ marginTop: 6, fontSize: 13, color: previewDays < 0 ? "var(--text-muted)" : previewDays <= 7 ? "var(--color-danger)" : "var(--accent-primary)", fontWeight: 600 }}>
                  → {fmtDays(previewDays)}
                </div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Emoji / Icon</label>
                <EmojiPicker value={icon} onChange={setIcon} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Màu sắc</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    style={{ width: 44, height: 44, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", cursor: "pointer", background: "none", padding: 2 }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{color}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={createCountdown.isPending || updateCountdown.isPending}>Lưu sự kiện</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ── Export helper for other pages (Dashboard etc.) ────────────────────────────
export { calcDaysRemaining, fmtDays, fmtDate, parseDateOnly };
