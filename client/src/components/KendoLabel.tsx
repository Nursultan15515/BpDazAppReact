import type { ReactNode } from "react";
import Box from "@mui/joy/Box";
import { kendo, type KendoLabelColor } from "./kendoTable";

interface Props {
  color: KendoLabelColor;
  children: ReactNode;
}

/**
 * Плашка `.label` из Bootstrap 3 — ей в BpDazApp помечали значения внутри
 * кендо-грида. Оригинал был `display: inline`; берём `inline-block`, чтобы
 * вертикальные отступы считались, — на глаз разницы нет.
 */
export function KendoLabel({ color, children }: Props) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        padding: "0.2em 0.6em 0.3em",
        fontSize: "75%",
        fontWeight: 700,
        lineHeight: 1,
        color: "#fff",
        textAlign: "center",
        whiteSpace: "nowrap",
        borderRadius: "0.25em",
        bgcolor: kendo.labels[color],
      }}
    >
      {children}
    </Box>
  );
}
