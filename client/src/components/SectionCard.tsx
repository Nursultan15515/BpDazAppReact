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

/** Строка «подпись: значение» внутри блока — та же вёрстка, что в PassBureau. */
export function SectionRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Typography level="body-sm" sx={{ mb: 0.5 }}>
      <strong>{label}:</strong> {value || "—"}
    </Typography>
  );
}
