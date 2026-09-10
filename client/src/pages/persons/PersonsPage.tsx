import { useCallback, useState } from "react";
import { TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import { useTranslation } from "react-i18next";
import { getPersons, type PersonListItem } from "../../app/persons.api";
import { useLoad } from "../../app/useLoad";
import { usePageState } from "../../app/usePageState";
import { Pagination } from "../../components/Pagination";
import { SearchToolbar } from "../../components/SearchToolbar";
import { TablePanel } from "../../components/TablePanel";
import { AddPersonDialog } from "./AddPersonDialog";

const noRows: PersonListItem[] = [];

export default function PersonsPage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  const { page, pageSize, setPage, changePageSize, firstPage } = usePageState();

  const fetcher = useCallback(
    () => getPersons(applied, page, pageSize), [applied, page, pageSize]);
  const { data, error, loading, loadedOnce } = useLoad(
    `${applied}|${page}|${pageSize}|${reloadToken}`, fetcher);
  const rows = data?.items ?? noRows;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 2, p: 2 }}>
      <Typography level="h4">{t("persons.title")}</Typography>

      <SearchToolbar
        search={search}
        placeholder={t("persons.searchPlaceholder")}
        loading={loading}
        addLabel={t("persons.add")}
        onSearchChange={setSearch}
        onApply={() => {
          setApplied(search);
          firstPage();
          setReloadToken((token) => token + 1);
        }}
        onAdd={() => setAddOpen(true)}
      />

      {error && <Alert color="danger" variant="soft">{t("persons.loadError")}: {error}</Alert>}

      <TablePanel loading={loading} hasData={loadedOnce} minWidth={1000}>
        <TableHead>
          <TableRow>
            <TableCell>{t("persons.colFio")}</TableCell>
            <TableCell>{t("persons.colDepartment")}</TableCell>
            <TableCell>{t("persons.colPosition")}</TableCell>
            <TableCell>{t("persons.colBuilding")}</TableCell>
            <TableCell sx={{ width: 110 }}>{t("persons.colPhoneInternal")}</TableCell>
            <TableCell>{t("persons.colEmail")}</TableCell>
            <TableCell sx={{ width: 160 }}>{t("persons.colLogin")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography level="body-sm" fontWeight={600}>{row.fio}</Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm" textColor="text.secondary">{row.departmentName}</Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm" textColor="text.secondary">{row.positionName}</Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm" textColor="text.secondary">
                  {row.place ? `${row.buildingName}, ${row.place}` : row.buildingName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm" textColor="text.secondary">
                  {row.phoneInternal || t("common.notSet")}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm" textColor="text.secondary">
                  {row.email || t("common.notSet")}
                </Typography>
              </TableCell>
              <TableCell>
                {row.login
                  ? <Chip size="sm" variant="soft" color="primary">{row.login}</Chip>
                  : <Typography level="body-sm" textColor="text.tertiary">{t("common.notSet")}</Typography>}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                {t("persons.noData")}
              </TableCell>
            </TableRow>
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

      <AddPersonDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          setReloadToken((token) => token + 1);
        }}
      />
    </Box>
  );
}
