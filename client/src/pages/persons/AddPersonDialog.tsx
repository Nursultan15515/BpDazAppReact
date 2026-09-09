import { useEffect, useState } from "react";
import Alert from "@mui/joy/Alert";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
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
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { getBuildings, getDepartments, getPositions, type BuildingOption, type DictOption } from "../../app/dicts.api";
import { createPerson } from "../../app/persons.api";
import { SectionCard } from "../../components/SectionCard";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm = {
  lastname: "",
  firstname: "",
  middleName: "",
  place: "",
  email: "",
  phoneInternal: "",
  phone: "",
  login: "",
  accountName: "",
};

export function AddPersonDialog({ open, onClose, onCreated }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      {/* Joy Modal размонтирует содержимое при закрытии — форма каждый раз пустая. */}
      <AddPersonForm onClose={onClose} onCreated={onCreated} />
    </Modal>
  );
}

function AddPersonForm({ onClose, onCreated }: Omit<Props, "open">) {
  const { t } = useTranslation();

  const [form, setForm] = useState(emptyForm);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [positionId, setPositionId] = useState<number | null>(null);
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [isUserOfSystem, setIsUserOfSystem] = useState(false);

  const [departments, setDepartments] = useState<DictOption[]>([]);
  const [positions, setPositions] = useState<DictOption[]>([]);
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => setDepartments([]));
    getPositions().then(setPositions).catch(() => setPositions([]));
    getBuildings().then(setBuildings).catch(() => setBuildings([]));
  }, []);

  const set = <K extends keyof typeof emptyForm>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const lastnameError = touched && form.lastname.trim() === "";
  const firstnameError = touched && form.firstname.trim() === "";
  const departmentError = touched && departmentId === null;
  const positionError = touched && positionId === null;
  const buildingError = touched && buildingId === null;
  const loginError = touched && isUserOfSystem && form.login.trim() === "";
  const accountError = touched && isUserOfSystem && form.accountName.trim() === "";

  const handleSubmit = async () => {
    setTouched(true);
    setError(null);

    if (
      form.lastname.trim() === ""
      || form.firstname.trim() === ""
      || departmentId === null
      || positionId === null
      || buildingId === null
      || (isUserOfSystem && (form.login.trim() === "" || form.accountName.trim() === ""))
    ) {
      return;
    }

    setSaving(true);
    try {
      await createPerson({
        lastname: form.lastname.trim(),
        firstname: form.firstname.trim(),
        middleName: form.middleName.trim() || undefined,
        departmentId,
        positionId,
        placeId: buildingId,
        place: form.place.trim() || undefined,
        email: form.email.trim() || undefined,
        phoneInternal: form.phoneInternal.trim() || undefined,
        phone: form.phone.trim() || undefined,
        isUserOfSystem,
        login: isUserOfSystem ? form.login.trim() : undefined,
        accountName: isUserOfSystem ? form.accountName.trim() : undefined,
      });
      onCreated();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog sx={{ width: 760, maxWidth: "95vw", maxHeight: "90vh" }}>
      <ModalClose />
      <DialogTitle>{t("persons.addTitle")}</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {error && <Alert color="danger" variant="soft">{error}</Alert>}

        <SectionCard title={t("persons.sectionMain")}>
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

          <FormControl size="sm" error={departmentError}>
            <FormLabel>{t("persons.department")}</FormLabel>
            <Select
              value={departmentId}
              onChange={(_, value) => setDepartmentId(value)}
              placeholder={t("common.notSet")}
            >
              {departments.map((d) => <Option key={d.id} value={d.id}>{d.title}</Option>)}
            </Select>
          </FormControl>

          <FormControl size="sm" error={positionError}>
            <FormLabel>{t("persons.position")}</FormLabel>
            <Select
              value={positionId}
              onChange={(_, value) => setPositionId(value)}
              placeholder={t("common.notSet")}
            >
              {positions.map((p) => <Option key={p.id} value={p.id}>{p.title}</Option>)}
            </Select>
          </FormControl>

          <FormControl size="sm" error={buildingError}>
            <FormLabel>{t("create.building")}</FormLabel>
            <Select
              value={buildingId}
              onChange={(_, value) => setBuildingId(value)}
              placeholder={t("common.notSet")}
            >
              {buildings.map((b) => <Option key={b.id} value={b.id}>{b.title}</Option>)}
            </Select>
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("create.place")}</FormLabel>
            <Input value={form.place} onChange={(e) => set("place", e.target.value)} />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("persons.email")}</FormLabel>
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("persons.phoneInternal")}</FormLabel>
            <Input value={form.phoneInternal} onChange={(e) => set("phoneInternal", e.target.value)} />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("persons.phone")}</FormLabel>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </FormControl>
        </SectionCard>

        <SectionCard title={t("persons.sectionAccount")}>
          <Checkbox
            size="sm"
            label={t("persons.isUserOfSystem")}
            checked={isUserOfSystem}
            onChange={(e) => setIsUserOfSystem(e.target.checked)}
            sx={{ gridColumn: { sm: "span 2" } }}
          />

          <FormControl size="sm" error={loginError} disabled={!isUserOfSystem}>
            <FormLabel>{t("persons.login")}</FormLabel>
            <Input value={form.login} onChange={(e) => set("login", e.target.value)} />
          </FormControl>

          <FormControl size="sm" error={accountError} disabled={!isUserOfSystem}>
            <FormLabel>{t("persons.accountName")}</FormLabel>
            <Input
              value={form.accountName}
              onChange={(e) => set("accountName", e.target.value)}
              placeholder="DOMAIN\\user"
            />
          </FormControl>
        </SectionCard>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleSubmit} loading={saving}>{t("create.submit")}</Button>
        <Button variant="plain" color="neutral" onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
      </DialogActions>
    </ModalDialog>
  );
}
