import { useCallback, useState } from "react";
import { TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useTranslation } from "react-i18next";
import { getUsers, type UserListItem } from "../../app/users.api";
import { useLoad } from "../../app/useLoad";
import { SearchToolbar } from "../../components/SearchToolbar";
import { TablePanel } from "../../components/TablePanel";
import { EditUserDialog } from "./EditUserDialog";

const noRows: UserListItem[] = [];

export default function UsersPage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);

  const fetcher = useCallback(() => getUsers(applied), [applied]);
  const { data, error, loading, loadedOnce } = useLoad(`${applied}|${reloadToken}`, fetcher);
  const rows = data ?? noRows;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 2, p: 2 }}>
      <Typography level="h4">{t("users.title")}</Typography>

      <SearchToolbar
        search={search}
        placeholder={t("users.searchPlaceholder")}
        loading={loading}
        onSearchChange={setSearch}
        onApply={() => {
          setApplied(search);
          setReloadToken((token) => token + 1);
        }}
      />

      {error && <Alert color="danger" variant="soft">{t("users.loadError")}: {error}</Alert>}

      <TablePanel loading={loading} hasData={loadedOnce} minWidth={900}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 64 }}>{t("requests.colId")}</TableCell>
            <TableCell>{t("users.colFio")}</TableCell>
            <TableCell>{t("users.colLogin")}</TableCell>
            <TableCell>{t("users.colAccountName")}</TableCell>
            <TableCell>{t("persons.colDepartment")}</TableCell>
            <TableCell sx={{ width: 120 }}>{t("users.colRole")}</TableCell>
            <TableCell sx={{ width: 56 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography level="body-sm" textColor="text.secondary">{row.id}</Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm" fontWeight={600}>{row.fio || t("common.notSet")}</Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm">{row.login || t("common.notSet")}</Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm" textColor="text.secondary">
                  {row.accountName || t("common.notSet")}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography level="body-sm" textColor="text.secondary">{row.departmentName}</Typography>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="soft" color={row.isAdmin ? "primary" : "neutral"}>
                  {row.isAdmin ? t("users.roleAdmin") : t("users.roleUser")}
                </Chip>
              </TableCell>
              <TableCell align="right" sx={{ pr: 1 }}>
                <Stack direction="row" justifyContent="flex-end">
                  <Tooltip title={t("users.edit")}>
                    <IconButton size="sm" variant="plain" color="neutral" onClick={() => setEditId(row.id)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                {t("users.noData")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TablePanel>

      <EditUserDialog
        userId={editId}
        onClose={() => setEditId(null)}
        onSaved={() => {
          setEditId(null);
          setReloadToken((token) => token + 1);
        }}
      />
    </Box>
  );
}
