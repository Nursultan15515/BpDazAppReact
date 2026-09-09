import { useState } from "react";
import Alert from "@mui/joy/Alert";
import Button from "@mui/joy/Button";
import DialogActions from "@mui/joy/DialogActions";
import DialogContent from "@mui/joy/DialogContent";
import DialogTitle from "@mui/joy/DialogTitle";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { addToBlackList } from "../../app/blacklist.api";
import { SectionCard } from "../../components/SectionCard";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm = { iin: "", lastname: "", firstname: "", middleName: "" };

export function AddBlackListDialog({ open, onClose, onCreated }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <AddBlackListForm onClose={onClose} onCreated={onCreated} />
    </Modal>
  );
}

function AddBlackListForm({ onClose, onCreated }: Omit<Props, "open">) {
  const { t } = useTranslation();

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const set = <K extends keyof typeof emptyForm>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const iinError = touched && !/^\d{12}$/.test(form.iin);
  const lastnameError = touched && form.lastname.trim() === "";
  const firstnameError = touched && form.firstname.trim() === "";

  const handleSubmit = async () => {
    setTouched(true);
    setError(null);

    if (!/^\d{12}$/.test(form.iin) || form.lastname.trim() === "" || form.firstname.trim() === "")
      return;

    setSaving(true);
    try {
      await addToBlackList({
        iin: form.iin,
        lastname: form.lastname.trim(),
        firstname: form.firstname.trim(),
        middleName: form.middleName.trim() || undefined,
      });
      onCreated();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog sx={{ width: 620, maxWidth: "95vw" }}>
      <ModalClose />
      <DialogTitle>{t("blacklist.addTitle")}</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {error && <Alert color="danger" variant="soft">{error}</Alert>}

        <SectionCard title={t("create.visitorSection")}>
          <FormControl size="sm" error={iinError}>
            <FormLabel>{t("create.iin")}</FormLabel>
            <Input
              value={form.iin}
              onChange={(e) => set("iin", e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="000000000000"
            />
            <FormHelperText>{t("create.iinHint")}</FormHelperText>
          </FormControl>

          <FormControl size="sm" error={lastnameError}>
            <FormLabel>{t("create.lastname")}</FormLabel>
            <Input value={form.lastname} onChange={(e) => set("lastname", e.target.value)} />
          </FormControl>

          <FormControl size="sm" error={firstnameError}>
            <FormLabel>{t("create.firstname")}</FormLabel>
            <Input value={form.firstname} onChange={(e) => set("firstname", e.target.value)} />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("create.middleName")}</FormLabel>
            <Input value={form.middleName} onChange={(e) => set("middleName", e.target.value)} />
          </FormControl>
        </SectionCard>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button color="danger" onClick={handleSubmit} loading={saving}>
          {t("blacklist.add")}
        </Button>
        <Button variant="plain" color="neutral" onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
      </DialogActions>
    </ModalDialog>
  );
}
