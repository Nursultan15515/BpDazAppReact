import type { ReactNode } from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";

/** Ширина: число (одинаковая на всех экранах) или значение по контрольным точкам. */
type ModalWidth = number | Record<string, number | string>;

interface Props {
  open: boolean;
  onClose: () => void;
  width?: ModalWidth;
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
          width: typeof width === "number" ? { xs: "95vw", sm: width } : width,
          // Страховка: как бы ни была задана ширина, окно не вылезает за экран.
          maxWidth: "95vw",
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
