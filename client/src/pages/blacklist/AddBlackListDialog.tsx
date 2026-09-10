import { useState } from "react";
import Alert from "@mui/joy/Alert";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { addToBlackList } from "../../app/blacklist.api";
import { ModalBody } from "../../components/ModalBody";
import { ModalFooter } from "../../components/ModalFooter";
import { ModalHeader } from "../../components/ModalHeader";
import { ModalGradient } from "../../components/modalGradients";
import { ModalShell } from "../../components/ModalShell";
import { SectionCard } from "../../components/SectionCard";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm = { iin: "", lastname: "", firstname: "", middleName: "" };

export function AddBlackListDialog({ open, onClose, onCreated }: Props) {
  return (
    <ModalShell open={open} onClose={onClose} width={620}>
      {open && <AddBlackListForm onClose={onClose} onCreated={onCreated} />}
    </ModalShell>
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
    <>
      <ModalHeader
        icon={<BlockRoundedIcon />}
        title={t("blacklist.addTitle")}
        gradient={ModalGradient.danger}
        busy={saving}
      />
      <ModalBody>
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
      </ModalBody>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmLabel={t("blacklist.add")}
        confirmColor="danger"
        loading={saving}
      />
    </>
  );
}
