import { useCallback, useState } from "react";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Snackbar from "@mui/joy/Snackbar";
import Typography from "@mui/joy/Typography";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import {
  exportRequests,
  getRequests,
  type RequestFilterMode,
  type RequestListItem,
} from "../../app/requests.api";
import { useDebouncedValue } from "../../app/useDebouncedValue";
import { useLoad } from "../../app/useLoad";
import { usePageState } from "../../app/usePageState";
import { Pagination } from "../../components/Pagination";
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

const initialPeriod: Period = { dateFrom: isoDate(-3), dateTo: isoDate() };

/** Поиск ищет по всей выборке, а не по странице, поэтому уходит на сервер с задержкой. */
const SearchDelayMs = 400;

/** Общая ссылка на пустой список, чтобы таблица не пересоздавала строки зря. */
const noRows: RequestListItem[] = [];

export default function RequestsPage({ onlyMine = false }: Props) {
  const { t } = useTranslation();

  const [mode, setMode] = useState<RequestFilterMode>("All");
  // Даты в тулбаре редактируются свободно, а на сервер уходят только по «Применить».
  const [draftPeriod, setDraftPeriod] = useState<Period>(initialPeriod);
  const [{ dateFrom, dateTo }, setPeriod] = useState<Period>(initialPeriod);
  const [search, setSearch] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const { page, pageSize, setPage, changePageSize, firstPage, stepBackIfEmptied } = usePageState();
  const appliedSearch = useDebouncedValue(search, SearchDelayMs);

  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  // Всплывающее подтверждение — замена iaoAlert из BpDazApp.
  const [toast, setToast] = useState<string | null>(null);

  const fetcher = useCallback(
    () => getRequests({ mode, dateFrom, dateTo, onlyMine, search: appliedSearch, page, pageSize }),
    [mode, dateFrom, dateTo, onlyMine, appliedSearch, page, pageSize]
  );

  // Пока ответ на текущий ключ не пришёл, список считается загружающимся,
  // но на экране остаются прошлые строки — вместо них крутится полоса прогресса.
  const { data, error, loading, loadedOnce } = useLoad(
    [mode, dateFrom, dateTo, onlyMine, appliedSearch, page, pageSize, reloadToken].join("|"),
    fetcher
  );

  const rows = data?.items ?? noRows;
  const reload = () => setReloadToken((token) => token + 1);

  // Выгружается вся выборка по фильтрам, поэтому page и pageSize не передаём.
  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportRequests({ mode, dateFrom, dateTo, onlyMine, search: appliedSearch });
    } catch (e) {
      setExportError(getErrorMessage(e));
    } finally {
      setExporting(false);
    }
  };

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
        onModeChange={(next) => {
          setMode(next);
          firstPage();
        }}
        onDateFromChange={(next) => setDraftPeriod((prev) => ({ ...prev, dateFrom: next }))}
        onDateToChange={(next) => setDraftPeriod((prev) => ({ ...prev, dateTo: next }))}
        onSearchChange={(next) => {
          setSearch(next);
          firstPage();
        }}
        onApply={() => {
          setPeriod(draftPeriod);
          firstPage();
        }}
        exporting={exporting}
        onExport={handleExport}
        onCreate={() => setCreateOpen(true)}
      />

      {error && <Alert color="danger" variant="soft">{t("requests.loadError")}: {error}</Alert>}
      {exportError && (
        <Alert color="danger" variant="soft">{t("requests.exportError")}: {exportError}</Alert>
      )}

      <RequestsTable
        rows={rows}
        loading={loading}
        hasData={loadedOnce}
        onRowOpen={(row) => setDetailsId(row.id)}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        onPageSizeChange={changePageSize}
      />

      <RequestDetailsModal
        requestId={detailsId}
        onClose={() => setDetailsId(null)}
        onDelete={setDeleteId}
      />

      <DeleteRequestDialog
        requestId={deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={() => {
          setDeleteId(null);
          // Карточку тоже закрываем: пропуска, который в ней открыт, больше нет.
          setDetailsId(null);
          setToast(t("requests.deleted"));
          stepBackIfEmptied(rows.length);
          reload();
        }}
      />

      <CreateRequestDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setToast(t("requests.created"));
          // Новая заявка получает наибольший номер, а список отсортирован по убыванию.
          firstPage();
          reload();
        }}
      />

      <Snackbar
        open={toast !== null}
        color="success"
        variant="soft"
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        startDecorator={<CheckCircleRoundedIcon />}
        onClose={() => setToast(null)}
      >
        {toast}
      </Snackbar>
    </Box>
  );
}
