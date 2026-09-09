import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import {
  getRequests,
  type RequestFilterMode,
  type RequestListItem,
} from "../../app/requests.api";
import { CreateRequestDialog } from "./CreateRequestDialog";
import { DeleteRequestDialog } from "./DeleteRequestDialog";
import { RequestDetailsModal } from "./RequestDetailsModal";
import { RequestsTable } from "./RequestsTable";
import { RequestsToolbar } from "./RequestsToolbar";
import { isoDate } from "./helpers";

interface Props {
  onlyMine?: boolean;
}

interface Period {
  dateFrom: string;
  dateTo: string;
}

interface LoadResult {
  key: string;
  rows: RequestListItem[];
  error: string | null;
}

const initialPeriod: Period = { dateFrom: isoDate(-3), dateTo: isoDate() };

/** Общая ссылка на пустой список, чтобы мемоизация поиска не сбрасывалась. */
const noRows: RequestListItem[] = [];

export default function RequestsPage({ onlyMine = false }: Props) {
  const { t } = useTranslation();

  const [mode, setMode] = useState<RequestFilterMode>("All");
  // Даты в тулбаре редактируются свободно, а на сервер уходят только по «Применить».
  const [draftPeriod, setDraftPeriod] = useState<Period>(initialPeriod);
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [search, setSearch] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [result, setResult] = useState<LoadResult | null>(null);

  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  // Ключ запроса: пока ответ на него не пришёл, список считается загружающимся,
  // но на экране остаются прошлые строки — вместо них крутится полоса прогресса.
  const key = [mode, period.dateFrom, period.dateTo, onlyMine, reloadToken].join("|");

  useEffect(() => {
    let cancelled = false;

    getRequests({ mode, dateFrom: period.dateFrom, dateTo: period.dateTo, onlyMine })
      .then((rows) => { if (!cancelled) setResult({ key, rows, error: null }); })
      .catch((e) => { if (!cancelled) setResult({ key, rows: [], error: getErrorMessage(e) }); });

    return () => { cancelled = true; };
  }, [key, mode, period, onlyMine]);

  const loading = result?.key !== key;
  const rows = result?.rows ?? noRows;
  const error = result?.key === key ? result.error : null;

  // Поиск фильтрует уже загруженный список — на сервер за этим не ходим.
  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === "") return rows;

    return rows.filter((row) =>
      [row.visitorName, row.visitorIin, row.hostDepartment, row.hostPersonName, row.makerName]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [rows, search]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 2, p: 2 }}>
      <Typography level="h4">
        {onlyMine ? t("sidebar.myRequests") : t("sidebar.allRequests")}
      </Typography>

      <RequestsToolbar
        mode={mode}
        dateFrom={draftPeriod.dateFrom}
        dateTo={draftPeriod.dateTo}
        search={search}
        loading={loading}
        onModeChange={setMode}
        onDateFromChange={(dateFrom) => setDraftPeriod((prev) => ({ ...prev, dateFrom }))}
        onDateToChange={(dateTo) => setDraftPeriod((prev) => ({ ...prev, dateTo }))}
        onSearchChange={setSearch}
        onApply={() => setPeriod(draftPeriod)}
        onCreate={() => setCreateOpen(true)}
      />

      {error && <Alert color="danger" variant="soft">{t("requests.loadError")}: {error}</Alert>}

      <RequestsTable
        rows={visibleRows}
        loading={loading}
        hasData={result !== null}
        onRowOpen={(row) => setDetailsId(row.id)}
        onRowDelete={(row) => setDeleteId(row.id)}
      />

      <RequestDetailsModal requestId={detailsId} onClose={() => setDetailsId(null)} />

      <DeleteRequestDialog
        requestId={deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={() => {
          setDeleteId(null);
          reload();
        }}
      />

      <CreateRequestDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          reload();
        }}
      />
    </Box>
  );
}
