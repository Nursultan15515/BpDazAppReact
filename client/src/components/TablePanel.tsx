import type { ReactNode } from "react";
import { Paper, Table, TableContainer } from "@mui/material";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import LinearProgress from "@mui/joy/LinearProgress";

interface Props {
  loading: boolean;
  /** Данные уже приходили — при повторной загрузке показываем полосу, а не спиннер. */
  hasData: boolean;
  minWidth?: number;
  children: ReactNode;
}

export function TablePanel({ loading, hasData, minWidth = 900, children }: Props) {
  if (loading && !hasData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {loading && (
        <LinearProgress
          sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, borderRadius: 0 }}
        />
      )}
      <TableContainer sx={{ flex: 1, overflow: "auto" }}>
        <Table size="small" stickyHeader sx={{ minWidth, "& td, & th": { px: 1 } }}>
          {children}
        </Table>
      </TableContainer>
    </Paper>
  );
}
