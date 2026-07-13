import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 520 }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100,
        animation: "fadeIn 200ms ease",
        padding: "var(--space-4)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          width: "100%",
          maxWidth,
          boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.04) inset",
          animation: "slideUp 250ms cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "var(--space-5) var(--space-6)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: "var(--radius-md)",
              background: "transparent", border: "none",
              color: "var(--text-muted)", cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            }}
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "var(--space-6)" }}>
          {children}
        </div>
      </div>
    </div>
  );
};
