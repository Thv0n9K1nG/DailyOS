import React, { useEffect } from "react";

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: number; }
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 520 }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      animation: "fadeIn 200ms ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)", padding: "var(--space-8)",
        width: "100%", maxWidth, boxShadow: "var(--shadow-lg)",
        animation: "slideUp 250ms cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-5)", color: "var(--text-primary)" }}>{title}</h2>
        {children}
      </div>
    </div>
  );
};
