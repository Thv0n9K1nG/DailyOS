import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title?: string; message: string; confirmLabel?: string; danger?: boolean;
}
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title = "Xác nhận", message,
  confirmLabel = "Xác nhận", danger = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={400}>
    <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>{message}</p>
    <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
      <Button variant="secondary" onClick={onClose}>Hủy</Button>
      <Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
    </div>
  </Modal>
);
