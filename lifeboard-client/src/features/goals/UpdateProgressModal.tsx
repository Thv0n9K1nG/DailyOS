import React, { useState, useEffect, useRef } from "react";
import { TrendingUp, Minus, Plus, Zap } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Goal } from "./api/goalApi";

interface UpdateProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, newValue: number) => void;
  goal: Goal | null;
  isLoading?: boolean;
}

export const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({
  isOpen, onClose, onSubmit, goal, isLoading,
}) => {
  const [value, setValue] = useState<string>("0");
  const [inputError, setInputError] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && goal) {
      setValue(String(goal.currentValue));
      setInputError("");
      setJustCompleted(false);
      // Auto-focus
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, goal]);

  if (!goal) return null;

  const numVal = parseFloat(value);
  const pct = isNaN(numVal)
    ? 0
    : Math.min(100, Math.round((numVal / goal.targetValue) * 100));
  const willComplete = !isNaN(numVal) && numVal >= goal.targetValue;
  const delta = isNaN(numVal) ? 0 : numVal - goal.currentValue;

  const step = (() => {
    const t = goal.targetValue;
    if (t >= 1000) return 10;
    if (t >= 100) return 1;
    return 0.5;
  })();

  const adjust = (dir: 1 | -1) => {
    const cur = parseFloat(value) || 0;
    const next = Math.max(0, Math.min(cur + dir * step, goal.targetValue * 10));
    setValue(String(parseFloat(next.toFixed(2))));
    setInputError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numVal) || numVal < 0) {
      setInputError("Giá trị không hợp lệ.");
      return;
    }
    if (numVal > goal.targetValue * 10) {
      setInputError(`Giá trị không được vượt quá ${goal.targetValue * 10}.`);
      return;
    }
    if (numVal >= goal.targetValue && !justCompleted) {
      // Show celebration prompt
      setJustCompleted(true);
      return;
    }
    onSubmit(goal.id, numVal);
  };

  const barColor = pct >= 100
    ? "var(--color-success)"
    : pct >= 70
    ? "linear-gradient(90deg, var(--accent-primary), var(--color-info))"
    : "linear-gradient(90deg, var(--accent-primary), var(--color-info))";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật tiến độ"
      maxWidth={440}
    >
      {/* Celebration overlay */}
      {justCompleted && (
        <div style={{
          textAlign: "center", padding: "var(--space-6) var(--space-4)",
          animation: "scaleIn 300ms cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{ fontSize: 64, marginBottom: "var(--space-3)", lineHeight: 1 }}>🎉</div>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-success)", marginBottom: "var(--space-2)" }}>
            Chúc mừng! Bạn đã đạt mục tiêu!
          </h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-5)" }}>
            <strong>{goal.title}</strong> sẽ được đánh dấu là <strong>Hoàn thành ✅</strong>
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center" }}>
            <Button variant="ghost" onClick={() => setJustCompleted(false)}>Quay lại</Button>
            <Button
              variant="primary"
              loading={isLoading}
              onClick={() => onSubmit(goal.id, numVal)}
              style={{ background: "var(--color-success)", boxShadow: "0 4px 12px rgba(82,215,191,0.3)" }}
            >
              🏆 Xác nhận hoàn thành
            </Button>
          </div>
        </div>
      )}

      {/* Normal form */}
      {!justCompleted && (
        <form onSubmit={handleSubmit}>
          {/* Goal info */}
          <div style={{
            padding: "var(--space-3) var(--space-4)",
            background: "var(--bg-overlay)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-5)",
          }}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              {goal.title}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Hiện tại: <strong style={{ color: "var(--text-secondary)" }}>{goal.currentValue}</strong>
              {" / "}
              Mục tiêu: <strong style={{ color: "var(--accent-primary)" }}>{goal.targetValue}</strong>
              {" "}{goal.unit}
            </div>
          </div>

          {/* Input with +/- */}
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)",
              marginBottom: "var(--space-2)",
            }}>
              <TrendingUp size={14} style={{ color: "var(--accent-primary)" }} />
              Giá trị mới ({goal.unit})
            </label>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => adjust(-1)}
                style={{
                  width: 36, height: 36, borderRadius: "var(--radius-md)",
                  background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Minus size={14} />
              </button>
              <Input
                ref={inputRef}
                type="number"
                min={0}
                step="any"
                value={value}
                onChange={e => { setValue(e.target.value); setInputError(""); }}
                style={{ textAlign: "center", flex: 1, fontWeight: 700, fontSize: "var(--text-lg)",
                  borderColor: inputError ? "var(--color-danger)" : undefined }}
              />
              <button
                type="button"
                onClick={() => adjust(1)}
                style={{
                  width: 36, height: 36, borderRadius: "var(--radius-md)",
                  background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Plus size={14} />
              </button>
            </div>
            {inputError && (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: 4 }}>{inputError}</p>
            )}
          </div>

          {/* Range slider */}
          <div style={{ marginBottom: "var(--space-3)" }}>
            <input
              type="range"
              min={0}
              max={goal.targetValue}
              step={step}
              value={isNaN(numVal) ? 0 : Math.min(numVal, goal.targetValue)}
              onChange={e => { setValue(e.target.value); setInputError(""); }}
              style={{ width: "100%", accentColor: "var(--accent-primary)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              <span>0</span>
              <span style={{
                color: pct >= 100 ? "var(--color-success)" : "var(--accent-primary)",
                fontWeight: 700,
              }}>
                {pct}%
              </span>
              <span>{goal.targetValue} {goal.unit}</span>
            </div>
          </div>

          {/* Progress bar preview */}
          <div style={{ background: "var(--bg-overlay)", borderRadius: "var(--radius-full)", height: 8, overflow: "hidden", marginBottom: "var(--space-4)" }}>
            <div style={{
              height: "100%",
              width: `${pct}%`,
              background: barColor,
              borderRadius: "var(--radius-full)",
              transition: "width 0.3s ease",
            }} />
          </div>

          {/* Delta indicator */}
          {delta !== 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              background: delta > 0 ? "rgba(82,215,191,0.1)" : "rgba(248,113,113,0.1)",
              border: `1px solid ${delta > 0 ? "rgba(82,215,191,0.2)" : "rgba(248,113,113,0.2)"}`,
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-xs)",
              color: delta > 0 ? "var(--color-success)" : "var(--color-danger)",
            }}>
              <Zap size={12} />
              {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} {goal.unit}
              {" so với trước"}
            </div>
          )}

          {/* Will complete banner */}
          {willComplete && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              background: "rgba(82,215,191,0.12)",
              border: "1px solid rgba(82,215,191,0.3)",
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-sm)",
              color: "var(--color-success)",
              fontWeight: 500,
            }}>
              🎯 Bạn sắp đạt mục tiêu! Nhấn lưu để xác nhận.
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              Lưu tiến độ
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
