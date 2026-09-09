import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import CircularProgress from "@mui/joy/CircularProgress";
import LinearProgress from "@mui/joy/LinearProgress";
import Tooltip from "@mui/joy/Tooltip";
import { useTranslation } from "react-i18next";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import type { RequestListItem } from "../../app/requests.api";
import { statusColor } from "./helpers";

interface Props {
  rows: RequestListItem[];
  loading: boolean;
  hasData: boolean;
  onRowOpen: (row: RequestListItem) => void;
  onRowDelete: (row: RequestListItem) => void;
}

export function RequestsTable({ rows, loading, hasData, onRowOpen, onRowDelete }: Props) {
  const { t } = useTranslation();

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
        {/* Колонок много, поэтому ужимаем горизонтальные отступы ячеек —
            иначе последняя колонка с действиями уезжает за край. */}
        <Table size="small" stickyHeader sx={{ minWidth: 1000, "& td, & th": { px: 1 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 64 }}>{t("requests.colId")}</TableCell>
              <TableCell>{t("requests.colVisitor")}</TableCell>
              <TableCell sx={{ width: 115 }}>{t("requests.colIin")}</TableCell>
              <TableCell>{t("requests.colBuilding")}</TableCell>
              <TableCell sx={{ width: 150 }}>{t("requests.colPeriod")}</TableCell>
              <TableCell sx={{ width: 150 }}>{t("requests.colEnterExit")}</TableCell>
              <TableCell>{t("requests.colDepartment")}</TableCell>
              <TableCell>{t("requests.colHost")}</TableCell>
              <TableCell>{t("requests.colAuthor")}</TableCell>
              <TableCell sx={{ width: 125 }}>{t("requests.colStatus")}</TableCell>
              <TableCell sx={{ width: 76 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography level="body-sm" textColor="text.secondary">{row.id}</Typography>
                </TableCell>
                <TableCell>
                  <Typography level="body-sm" fontWeight={600}>{row.visitorName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography level="body-sm">{row.visitorIin || t("common.notSet")}</Typography>
                </TableCell>
                <TableCell>
                  <Typography level="body-sm" textColor="text.secondary">
                    {row.place ? `${row.targetBuilding}, ${row.place}` : row.targetBuilding}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography level="body-sm" textColor="text.secondary">{row.period}</Typography>
                </TableCell>
                <TableCell>
                  <Typography level="body-sm" textColor="text.secondary">
                    {row.enterExitTime || t("common.notSet")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography level="body-sm" textColor="text.secondary">{row.hostDepartment}</Typography>
                </TableCell>
                <TableCell>
                  <Typography level="body-sm" textColor="text.secondary">{row.hostPersonName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography level="body-sm" textColor="text.secondary">{row.makerName}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="soft" color={statusColor[row.status]}>
                    {t(`status.${row.status}`)}
                  </Chip>
                </TableCell>
                <TableCell align="right" sx={{ pr: 1 }}>
                  <Stack direction="row" justifyContent="flex-end">
                    <Tooltip title={t("requests.view")}>
                      <IconButton size="sm" variant="plain" color="neutral" onClick={() => onRowOpen(row)}>
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("requests.delete")}>
                      <IconButton size="sm" variant="plain" color="danger" onClick={() => onRowDelete(row)}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  {t("requests.noData")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
