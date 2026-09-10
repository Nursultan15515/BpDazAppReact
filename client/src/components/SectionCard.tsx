import type { ReactNode } from "react";
import { Paper } from "@mui/material";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";

interface Props {
  title: string;
  /**
   * Количество колонок сетки. 12 позволяет повторить пропорции
   * бутстраповской вёрстки BpDazApp (col-md-4 → span 4 и т.д.).
   */
  columns?: number;
  children: ReactNode;
}

/** Блок внутри модального окна — оформление как в PassBureau. */
export function SectionCard({ title, columns = 2, children }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200" }}
    >
      <Typography level="title-md" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: `repeat(${columns}, 1fr)` },
          gap: 1.25,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

interface RowProps {
  label: string;
  value?: string | null;
  /** Растянуть на несколько колонок сетки SectionCard. */
  span?: number;
}

/**
 * Строка «подпись — значение» в столбик: приглушённая подпись сверху, значение
 * под ней. Подпись оформлена как в мета-блоке карточки пропуска PassBureau,
 * а выделено здесь значение, а не подпись — так строка читается сверху вниз.
 * Пустое значение остаётся бледным, чтобы заполненные поля выделялись.
 */
export function SectionRow({ label, value, span }: RowProps) {
  const filled = Boolean(value);

  return (
    <Box sx={{ minWidth: 0, ...(span ? { gridColumn: `span ${span}` } : null) }}>
      <Typography
        sx={{
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "text.tertiary",
        }}
      >
        {label}
      </Typography>
      <Typography
        level="body-sm"
        fontWeight={filled ? 600 : 400}
        textColor={filled ? "text.primary" : "text.tertiary"}
        sx={{ wordBreak: "break-word" }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}
