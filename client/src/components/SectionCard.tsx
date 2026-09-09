import type { ReactNode } from "react";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";

interface Props {
  title: string;
  children: ReactNode;
}

export function SectionCard({ title, children }: Props) {
  return (
    <Sheet variant="outlined" sx={{ borderRadius: "sm", p: 2 }}>
      <Typography level="title-sm" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1.5,
        }}
      >
        {children}
      </Box>
    </Sheet>
  );
}
