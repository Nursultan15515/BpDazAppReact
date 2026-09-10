import type { ReactNode } from "react";
import Box from "@mui/joy/Box";

/** Прокручиваемая середина модального окна между шапкой и футером. */
export function ModalBody({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
        minHeight: 0,
      }}
    >
      {children}
    </Box>
  );
}
