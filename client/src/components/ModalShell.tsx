import type { ReactNode } from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Ширина на десктопе; на узких экранах окно всегда 95vw. */
  width?: number;
  children: ReactNode;
}

/**
 * Оболочка модального окна: размытый фон, скруглённые углы без рамки
 * и мягкая тень. Оформление взято из модальных окон PassBureau.
 */
export function ModalShell({ open, onClose, width = 680, children }: Props) {
  return (
    <Modal open={open} onClose={onClose} sx={{ backdropFilter: "blur(4px)" }}>
      <ModalDialog
        layout="center"
        sx={{
          width: { xs: "95vw", sm: width },
          maxHeight: "90vh",
          p: 0,
          overflow: "hidden",
          borderRadius: "xl",
          border: "none",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </ModalDialog>
    </Modal>
  );
}
