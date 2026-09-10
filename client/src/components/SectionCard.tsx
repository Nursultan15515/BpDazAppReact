import type { ReactNode } from "react";
import Sheet from "@mui/joy/Sheet";
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

export function SectionCard({ title, columns = 2, children }: Props) {
  return (
    <Sheet variant="outlined" sx={{ borderRadius: "sm", p: 2 }}>
      <Typography level="title-sm" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: `repeat(${columns}, 1fr)` },
          gap: 1.5,
        }}
      >
        {children}
      </Box>
    </Sheet>
  );
}
