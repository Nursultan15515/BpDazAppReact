import { useEffect, useState } from "react";
import Alert from "@mui/joy/Alert";
import Autocomplete from "@mui/joy/Autocomplete";
import AutocompleteOption from "@mui/joy/AutocompleteOption";
import Box from "@mui/joy/Box";
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
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Textarea from "@mui/joy/Textarea";
import Typography from "@mui/joy/Typography";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import {
  getBuildings,
  searchOrganizations,
  searchPersons,
  type BuildingOption,
  type PersonOption,
} from "../../app/dicts.api";
import { createRequest } from "../../app/requests.api";
import { SectionCard } from "../../components/SectionCard";
import { isoDate } from "./helpers";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm = {
  iin: "",
  lastname: "",
  firstname: "",
  middleName: "",
  organization: "",
  mobilePhone: "",
  date: isoDate(),
  timeFrom: "09:00",
  timeTo: "18:00",
  place: "",
  hostPhone: "",
  purpose: "",
};

export function CreateRequestDialog({ open, onClose, onCreated }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      {/* Joy Modal размонтирует содержимое при закрытии, поэтому форма
          каждый раз открывается пустой без ручного сброса состояния. */}
      <CreateRequestForm onClose={onClose} onCreated={onCreated} />
    </Modal>
  );
}

function CreateRequestForm({ onClose, onCreated }: Omit<Props, "open">) {
  const { t } = useTranslation();

  const [form, setForm] = useState(emptyForm);
  const [host, setHost] = useState<PersonOption | null>(null);
  const [buildingId, setBuildingId] = useState<number | null>(null);

  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [organizations, setOrganizations] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    getBuildings().then(setBuildings).catch(() => setBuildings([]));
    searchPersons("").then(setPersons).catch(() => setPersons([]));
    searchOrganizations("").then(setOrganizations).catch(() => setOrganizations([]));
  }, []);

  const set = <K extends keyof typeof emptyForm>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const iinError = touched && !/^\d{12}$/.test(form.iin);
  const lastnameError = touched && form.lastname.trim() === "";
  const firstnameError = touched && form.firstname.trim() === "";
  const hostError = touched && host === null;
  const buildingError = touched && buildingId === null;

  const handleHostChange = (person: PersonOption | null) => {
    setHost(person);
    if (!person) return;

    // Здание, кабинет и внутренний телефон подставляем из карточки сотрудника —
    // как делал AddRequest в BpDazApp.
    setBuildingId(person.placeId);
    setForm((prev) => ({
      ...prev,
      place: person.place ?? prev.place,
      hostPhone: person.phoneInternal ?? prev.hostPhone,
    }));
  };

  const handleSubmit = async () => {
    setTouched(true);
    setError(null);

    if (
      !/^\d{12}$/.test(form.iin)
      || form.lastname.trim() === ""
      || form.firstname.trim() === ""
      || host === null
      || buildingId === null
    ) {
      return;
    }

    setSaving(true);
    try {
      await createRequest({
        iin: form.iin,
        lastname: form.lastname.trim(),
        firstname: form.firstname.trim(),
        middleName: form.middleName.trim() || undefined,
        organization: form.organization.trim() || undefined,
        mobilePhone: form.mobilePhone.trim() || undefined,
        date: form.date,
        timeFrom: form.timeFrom,
        timeTo: form.timeTo,
        hostPersonId: host.id,
        placeId: buildingId,
        place: form.place.trim() || undefined,
        hostPhone: form.hostPhone.trim() || undefined,
        purpose: form.purpose.trim() || undefined,
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
      <DialogTitle>{t("create.title")}</DialogTitle>
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

          <FormControl size="sm">
            <FormLabel>{t("create.mobilePhone")}</FormLabel>
            <Input value={form.mobilePhone} onChange={(e) => set("mobilePhone", e.target.value)} />
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

          <FormControl size="sm">
            <FormLabel>{t("create.organization")}</FormLabel>
            <Autocomplete
              size="sm"
              freeSolo
              options={organizations}
              value={form.organization}
              onChange={(_, value) => set("organization", value ?? "")}
              onInputChange={(_, value) => {
                set("organization", value);
                searchOrganizations(value).then(setOrganizations).catch(() => { });
              }}
            />
          </FormControl>
        </SectionCard>

        <SectionCard title={t("create.visitSection")}>
          <FormControl size="sm" error={hostError} sx={{ gridColumn: { sm: "span 2" } }}>
            <FormLabel>{t("create.host")}</FormLabel>
            <Autocomplete
              size="sm"
              placeholder={t("create.hostPlaceholder")}
              options={persons}
              value={host}
              getOptionLabel={(option) => option.fio}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => handleHostChange(value)}
              onInputChange={(_, value) => {
                searchPersons(value).then(setPersons).catch(() => { });
              }}
              renderOption={(props, option) => (
                <AutocompleteOption {...props} key={option.id}>
                  <Box>
                    <Typography level="body-sm">{option.fio}</Typography>
                    <Typography level="body-xs" textColor="text.tertiary">
                      {option.positionName} · {option.departmentName}
                    </Typography>
                  </Box>
                </AutocompleteOption>
              )}
            />
          </FormControl>

          <FormControl size="sm" error={buildingError}>
            <FormLabel>{t("create.building")}</FormLabel>
            <Select
              value={buildingId}
              onChange={(_, value) => setBuildingId(value)}
              placeholder={t("common.notSet")}
            >
              {buildings.map((b) => (
                <Option key={b.id} value={b.id}>{b.title}</Option>
              ))}
            </Select>
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("create.place")}</FormLabel>
            <Input value={form.place} onChange={(e) => set("place", e.target.value)} />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("create.date")}</FormLabel>
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("create.hostPhone")}</FormLabel>
            <Input value={form.hostPhone} onChange={(e) => set("hostPhone", e.target.value)} />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("create.timeFrom")}</FormLabel>
            <Input type="time" value={form.timeFrom} onChange={(e) => set("timeFrom", e.target.value)} />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>{t("create.timeTo")}</FormLabel>
            <Input type="time" value={form.timeTo} onChange={(e) => set("timeTo", e.target.value)} />
          </FormControl>

          <FormControl size="sm" sx={{ gridColumn: { sm: "span 2" } }}>
            <FormLabel>{t("create.purpose")}</FormLabel>
            <Textarea
              minRows={2}
              value={form.purpose}
              onChange={(e) => set("purpose", e.target.value)}
            />
          </FormControl>
        </SectionCard>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleSubmit} loading={saving}>
          {t("create.submit")}
        </Button>
        <Button variant="plain" color="neutral" onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
      </DialogActions>
    </ModalDialog>
  );
}
