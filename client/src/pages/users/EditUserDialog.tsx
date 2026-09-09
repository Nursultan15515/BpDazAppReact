import { useCallback, useState } from "react";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import CircularProgress from "@mui/joy/CircularProgress";
import DialogActions from "@mui/joy/DialogActions";
import DialogContent from "@mui/joy/DialogContent";
import DialogTitle from "@mui/joy/DialogTitle";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { getUser, updateUser, type UserEditItem } from "../../app/users.api";
import { useLoad } from "../../app/useLoad";
import { SectionCard } from "../../components/SectionCard";

interface Props {
  userId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditUserDialog({ userId, onClose, onSaved }: Props) {
  return (
    <Modal open={userId !== null} onClose={onClose}>
      <ModalDialog sx={{ width: 620, maxWidth: "95vw" }}>
        <ModalClose />
        {userId !== null && <EditUserBody userId={userId} onClose={onClose} onSaved={onSaved} />}
      </ModalDialog>
    </Modal>
  );
}

function EditUserBody({ userId, onClose, onSaved }: { userId: number } & Omit<Props, "userId">) {
  const { t } = useTranslation();

  const fetcher = useCallback(() => getUser(userId), [userId]);
  const { data, error: loadError, loading } = useLoad(`user-${userId}`, fetcher);

  // Правки поверх загруженной карточки: пока их нет, показываем значения из ответа.
  const [edits, setEdits] = useState<Partial<UserEditItem>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const value = { ...data, ...edits } as Partial<UserEditItem>;
  const set = <K extends keyof UserEditItem>(key: K, v: UserEditItem[K]) =>
    setEdits((prev) => ({ ...prev, [key]: v }));

  const login = (value.login ?? "").trim();
  const accountName = (value.accountName ?? "").trim();
  const loginError = touched && login === "";
  const accountError = touched && accountName === "";

  const handleSubmit = async () => {
    setTouched(true);
    setSaveError(null);

    if (login === "" || accountName === "") return;

    setSaving(true);
    try {
      await updateUser(userId, {
        lastname: value.lastname ?? undefined,
        firstname: value.firstname ?? undefined,
        middleName: value.middleName ?? undefined,
        login,
        accountName,
        isAdmin: value.isAdmin ?? false,
      });
      onSaved();
    } catch (e) {
      setSaveError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogTitle>{t("users.editTitle", { id: userId })}</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {loadError && <Alert color="danger" variant="soft">{loadError}</Alert>}
        {saveError && <Alert color="danger" variant="soft">{saveError}</Alert>}

        {data && (
          <SectionCard title={t("users.sectionMain")}>
            <FormControl size="sm">
              <FormLabel>{t("create.lastname")}</FormLabel>
              <Input value={value.lastname ?? ""} onChange={(e) => set("lastname", e.target.value)} />
            </FormControl>

            <FormControl size="sm">
              <FormLabel>{t("create.firstname")}</FormLabel>
              <Input value={value.firstname ?? ""} onChange={(e) => set("firstname", e.target.value)} />
            </FormControl>

            <FormControl size="sm">
              <FormLabel>{t("create.middleName")}</FormLabel>
              <Input value={value.middleName ?? ""} onChange={(e) => set("middleName", e.target.value)} />
            </FormControl>

            <FormControl size="sm" error={loginError}>
              <FormLabel>{t("users.colLogin")}</FormLabel>
              <Input value={value.login ?? ""} onChange={(e) => set("login", e.target.value)} />
            </FormControl>

            <FormControl size="sm" error={accountError}>
              <FormLabel>{t("users.colAccountName")}</FormLabel>
              <Input value={value.accountName ?? ""} onChange={(e) => set("accountName", e.target.value)} />
            </FormControl>

            <Checkbox
              size="sm"
              label={t("users.isAdmin")}
              checked={value.isAdmin ?? false}
              onChange={(e) => set("isAdmin", e.target.checked)}
              sx={{ alignSelf: "end", pb: 1 }}
            />
          </SectionCard>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleSubmit} loading={saving} disabled={!data}>
          {t("users.save")}
        </Button>
        <Button variant="plain" color="neutral" onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
      </DialogActions>
    </>
  );
}
