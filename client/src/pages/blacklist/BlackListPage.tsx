import { useCallback, useState } from "react";
import { TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useTranslation } from "react-i18next";
import { getBlackList, type BlackListItem } from "../../app/blacklist.api";
import { useLoad } from "../../app/useLoad";
import { usePageState } from "../../app/usePageState";
import { Pagination } from "../../components/Pagination";
import { SearchToolbar } from "../../components/SearchToolbar";
import { TableEmptyRow } from "../../components/TableEmptyRow";
import { TablePanel } from "../../components/TablePanel";
import { AddBlackListDialog } from "./AddBlackListDialog";
import { RemoveBlackListDialog } from "./RemoveBlackListDialog";

const noRows: BlackListItem[] = [];

export default function BlackListPage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);

  const { page, pageSize, setPage, changePageSize, firstPage, stepBackIfEmptied } = usePageState();

  const fetcher = useCallback(
    () => getBlackList(applied, page, pageSize), [applied, page, pageSize]);
  const { data, error, loading, loadedOnce } = useLoad(
    `${applied}|${page}|${pageSize}|${reloadToken}`, fetcher);
  const rows = data?.items ?? noRows;

  const reload = () => setReloadToken((token) => token + 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 2, p: 2 }}>
      <Typography level="h4">{t("blacklist.title")}</Typography>

      <SearchToolbar
        search={search}
        placeholder={t("blacklist.searchPlaceholder")}
        loading={loading}
        addLabel={t("blacklist.add")}
        onSearchChange={setSearch}
        onApply={() => {
          setApplied(search);
          firstPage();
          reload();
        }}
        onAdd={() => setAddOpen(true)}
      />

      {error && <Alert color="danger" variant="soft">{t("blacklist.loadError")}: {error}</Alert>}

      <TablePanel loading={loading} hasData={loadedOnce} minWidth={800}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 64 }}>{t("requests.colId")}</TableCell>
            <TableCell sx={{ width: 130 }}>{t("create.iin")}</TableCell>
            <TableCell>{t("create.lastname")}</TableCell>
            <TableCell>{t("create.firstname")}</TableCell>
            <TableCell>{t("create.middleName")}</TableCell>
            <TableCell sx={{ width: 120 }}>{t("blacklist.colDate")}</TableCell>
            <TableCell>{t("blacklist.colAuthor")}</TableCell>
            <TableCell sx={{ width: 56 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.iin || t("common.notSet")}</TableCell>
              <TableCell>{row.lastname}</TableCell>
              <TableCell>{row.firstname}</TableCell>
              <TableCell>{row.middleName || t("common.notSet")}</TableCell>
              <TableCell>{new Date(row.createdDate).toLocaleDateString()}</TableCell>
              <TableCell>{row.createdBy}</TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent="flex-end">
                  <Tooltip title={t("blacklist.remove")}>
                    <IconButton size="sm" variant="plain" color="danger" onClick={() => setRemoveId(row.id)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !loading && (
            <TableEmptyRow colSpan={8} text={t("blacklist.noData")} />
          )}
        </TableBody>
      </TablePanel>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        onPageSizeChange={changePageSize}
      />

      <AddBlackListDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          reload();
        }}
      />

      <RemoveBlackListDialog
        entryId={removeId}
        onClose={() => setRemoveId(null)}
        onRemoved={() => {
          setRemoveId(null);
          stepBackIfEmptied(rows.length);
          reload();
        }}
      />
    </Box>
  );
}
