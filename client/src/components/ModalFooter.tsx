import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { useTranslation } from "react-i18next";
import { ModalGradient } from "./modalGradients";

interface Props {
  onCancel: () => void;
  /** Без обработчика футер показывает одну кнопку закрытия — как в окне просмотра. */
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmColor?: "primary" | "danger";
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmColor = "primary",
  cancelLabel,
  loading = false,
  disabled = false,
}: Props) {
  const { t } = useTranslation();

  // Окно просмотра: одна кнопка справа, без отбивки и подложки —
  // так сделана карточка посетителя на главной странице PassBureau.
  if (!onConfirm) {
    return (
      <Box sx={{ px: 3, pb: 3, pt: 0, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
        <Button variant="outlined" color="neutral" onClick={onCancel}>
          {cancelLabel ?? t("common.close")}
        </Button>
      </Box>
    );
  }

  // Окно с действием: отбивка сверху и кнопка подтверждения с заливкой.
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.level1",
        display: "flex",
        justifyContent: "flex-end",
        gap: 1.5,
        flexShrink: 0,
      }}
    >
      <Button
        variant="outlined"
        color="neutral"
        onClick={onCancel}
        disabled={loading}
        sx={{ borderRadius: "lg" }}
      >
        {cancelLabel ?? t("common.cancel")}
      </Button>

      <Button
        variant="solid"
        color={confirmColor}
        onClick={onConfirm}
        loading={loading}
        disabled={disabled}
        sx={{
          borderRadius: "lg",
          background: confirmColor === "danger" ? ModalGradient.danger : ModalGradient.primary,
          "&:hover": {
            background: confirmColor === "danger"
              ? ModalGradient.dangerHover
              : ModalGradient.primaryHover,
          },
          "&:disabled": { background: "none" },
        }}
      >
        {confirmLabel}
      </Button>
    </Box>
  );
}
