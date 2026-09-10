import type { ReactNode } from "react";
import Box from "@mui/joy/Box";
import LinearProgress from "@mui/joy/LinearProgress";
import ModalClose from "@mui/joy/ModalClose";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { ModalGradient } from "./modalGradients";

interface Props {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  /** Показывает полосу загрузки по нижней кромке шапки. */
  busy?: boolean;
  gradient?: string;
}

/**
 * Шапка модального окна. Повторяет карточку посетителя с главной страницы
 * PassBureau: градиент в тёмно-синий, отступ 24px, плитка с иконкой и крупный
 * белый заголовок.
 */
export function ModalHeader({
  icon,
  title,
  subtitle,
  busy = false,
  gradient = ModalGradient.primary,
}: Props) {
  return (
    <Box sx={{ background: gradient, p: 3, position: "relative", flexShrink: 0 }}>
      <ModalClose sx={{ color: "white", "&:hover": { background: "rgba(255,255,255,0.15)" } }} />
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "md",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: "white", display: "flex", alignItems: "center", fontSize: 20 }}>
            {icon}
          </Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="h4" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.72)" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {busy && (
        <LinearProgress
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            "--LinearProgress-progressColor": "white",
            "--LinearProgress-trackColor": "rgba(255,255,255,0.2)",
          }}
        />
      )}
    </Box>
  );
}
