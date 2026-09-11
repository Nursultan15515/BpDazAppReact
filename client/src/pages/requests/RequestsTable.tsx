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
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import CircularProgress from "@mui/joy/CircularProgress";
import LinearProgress from "@mui/joy/LinearProgress";
import Tooltip from "@mui/joy/Tooltip";
import { useTranslation } from "react-i18next";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import type { RequestListItem } from "../../app/requests.api";
import { KendoLabel } from "../../components/KendoLabel";
import { TableEmptyRow } from "../../components/TableEmptyRow";
import { kendoPanelSx, kendoTableSx } from "../../components/kendoTable";
import { statusColor } from "./helpers";

interface Props {
  rows: RequestListItem[];
  loading: boolean;
  hasData: boolean;
  onRowOpen: (row: RequestListItem) => void;
}

export function RequestsTable({ rows, loading, hasData, onRowOpen }: Props) {
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
        ...kendoPanelSx,
      }}
    >
      {loading && (
        <LinearProgress
          sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, borderRadius: 0 }}
        />
      )}
      <TableContainer sx={{ flex: 1, overflow: "auto" }}>
        {/* Колонок много, поэтому таблице задан минимум по ширине —
            иначе последняя колонка с действиями уезжает за край. */}
        <Table size="small" stickyHeader sx={{ minWidth: 1100, ...kendoTableSx }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 64 }}>{t("requests.colId")}</TableCell>
              <TableCell>{t("requests.colVisitor")}</TableCell>
              <TableCell sx={{ width: 115 }}>{t("requests.colIin")}</TableCell>
              <TableCell>{t("requests.colBuilding")}</TableCell>
              {/* 170px — ширина колонки «Период» из кендо-грида BpDazApp.
                  «Вход - выход» держит такую же дату, поэтому ширина та же. */}
              <TableCell sx={{ width: 170 }}>{t("requests.colPeriod")}</TableCell>
              <TableCell sx={{ width: 170 }}>{t("requests.colEnterExit")}</TableCell>
              <TableCell>{t("requests.colDepartment")}</TableCell>
              <TableCell>{t("requests.colHost")}</TableCell>
              <TableCell>{t("requests.colAuthor")}</TableCell>
              <TableCell sx={{ width: 125 }}>{t("requests.colStatus")}</TableCell>
              <TableCell sx={{ width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              // Текст в ячейках однотонный, без выделения ФИО и приглушённых
              // колонок: в кендо-гриде все значения шли одним начертанием.
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.visitorName}</TableCell>
                <TableCell>{row.visitorIin || t("common.notSet")}</TableCell>
                <TableCell>
                  {row.place ? `${row.targetBuilding}, ${row.place}` : row.targetBuilding}
                </TableCell>
                <TableCell>{row.period}</TableCell>
                <TableCell>{row.enterExitTime || t("common.notSet")}</TableCell>
                <TableCell>{row.hostDepartment}</TableCell>
                <TableCell>{row.hostPersonName}</TableCell>
                <TableCell>{row.makerName}</TableCell>
                <TableCell>
                  <KendoLabel color={statusColor[row.status]}>
                    {t(`status.${row.status}`)}
                  </KendoLabel>
                </TableCell>
                {/* Удаление живёт в карточке, как в BpDazApp: оно доступно
                    не для всякого статуса, а список статуса кнопки не знает. */}
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end">
                    <Tooltip title={t("requests.view")}>
                      <IconButton size="sm" variant="plain" color="neutral" onClick={() => onRowOpen(row)}>
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && !loading && (
              <TableEmptyRow colSpan={11} text={t("requests.noData")} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
