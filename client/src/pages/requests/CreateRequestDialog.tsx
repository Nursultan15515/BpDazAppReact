import { useEffect, useRef, useState } from "react";
import Alert from "@mui/joy/Alert";
import Autocomplete from "@mui/joy/Autocomplete";
import AutocompleteOption from "@mui/joy/AutocompleteOption";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Typography from "@mui/joy/Typography";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import {
  getBuildings,
  getCurrentPerson,
  searchOrganizations,
  searchPersons,
  type BuildingOption,
  type PersonOption,
} from "../../app/dicts.api";
import { formatPhone, isPhoneComplete } from "../../app/phone";
import { createRequest } from "../../app/requests.api";
import { useDebouncedValue } from "../../app/useDebouncedValue";
import { findVisitorByIin } from "../../app/visitors.api";
import { ModalBody } from "../../components/ModalBody";
import { ModalFooter } from "../../components/ModalFooter";
import { ModalHeader } from "../../components/ModalHeader";
import { ModalShell } from "../../components/ModalShell";
import { PhoneInput } from "../../components/PhoneInput";
import { SectionCard } from "../../components/SectionCard";
import { isoDate, nowTime } from "./helpers";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

/** Задержка перед поиском — в BpDazApp это setTimeout на 2 секунды. */
const SearchDelayMs = 2000;

/** Поиск принимающего в оригинале стартовал от двух символов. */
const MinHostQueryLength = 2;

// Ширина повторяет бутстраповский .container из BpDazApp: 750 / 970 / 1170.
const FormWidth = { xs: "95vw", sm: 750, md: 970, lg: 1170 };

export function CreateRequestDialog({ open, onClose, onCreated }: Props) {
  return (
    <ModalShell open={open} onClose={onClose} width={FormWidth}>
      {/* Содержимое размонтируется при закрытии, поэтому форма
          каждый раз открывается пустой без ручного сброса состояния. */}
      {open && <CreateRequestForm onClose={onClose} onCreated={onCreated} />}
    </ModalShell>
  );
}

function CreateRequestForm({ onClose, onCreated }: Omit<Props, "open">) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    iin: "",
    lastname: "",
    firstname: "",
    middleName: "",
    organization: "",
    mobilePhone: "",
    date: isoDate(),
    timeFrom: nowTime(),
    timeTo: "18:00",
    place: "",
    hostPhone: "",
    purpose: "",
  });

  const [host, setHost] = useState<PersonOption | null>(null);
  const [buildingId, setBuildingId] = useState<number | null>(null);

  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [organizations, setOrganizations] = useState<string[]>([]);

  const [hostQuery, setHostQuery] = useState("");
  const [orgQuery, setOrgQuery] = useState("");
  const debouncedHostQuery = useDebouncedValue(hostQuery, SearchDelayMs);
  const debouncedOrgQuery = useDebouncedValue(orgQuery, SearchDelayMs);
  // Запрос, по которому уже получен ответ: из него выводится состояние загрузки,
  // поэтому спиннер горит и во время паузы перед запросом.
  const [personsFor, setPersonsFor] = useState<string | null>(null);
  const [organizationsFor, setOrganizationsFor] = useState<string | null>(null);

  /** Пользователь сам тронул поле принимающего — подстановку по умолчанию отменяем. */
  const hostTouched = useRef(false);

  const [iinSearching, setIinSearching] = useState(false);
  const [iinNotice, setIinNotice] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    getBuildings().then(setBuildings).catch(() => setBuildings([]));

    // Принимающий по умолчанию — сам пользователь, как ViewBag.DefaultHostPerson.
    // Если пользователь успел начать выбирать сам, подстановку не делаем:
    // иначе поздний ответ затрёт то, что он уже набрал.
    getCurrentPerson()
      .then((person) => { if (person && !hostTouched.current) applyHost(person); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const query = debouncedHostQuery.trim();
    if (query.length < MinHostQueryLength) return;

    let cancelled = false;
    const finish = (result: PersonOption[]) => {
      if (cancelled) return;
      setPersons(result);
      setPersonsFor(query);
    };

    searchPersons(query).then(finish).catch(() => finish([]));
    return () => { cancelled = true; };
  }, [debouncedHostQuery]);

  useEffect(() => {
    const query = debouncedOrgQuery.trim();
    if (query === "") return;

    let cancelled = false;
    const finish = (result: string[]) => {
      if (cancelled) return;
      setOrganizations(result);
      setOrganizationsFor(query);
    };

    searchOrganizations(query).then(finish).catch(() => finish([]));
    return () => { cancelled = true; };
  }, [debouncedOrgQuery]);

  const hostLoading = hostQuery.trim().length >= MinHostQueryLength
    && personsFor !== hostQuery.trim();
  const orgLoading = orgQuery.trim() !== "" && organizationsFor !== orgQuery.trim();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const iinValid = /^\d{12}$/.test(form.iin);
  const iinError = touched && !iinValid;
  const lastnameError = touched && form.lastname.trim() === "";
  const firstnameError = touched && form.firstname.trim() === "";
  const phoneError = touched && !isPhoneComplete(form.mobilePhone);
  const purposeError = touched && form.purpose.trim() === "";
  const hostError = touched && host === null;
  const buildingError = touched && buildingId === null;

  function applyHost(person: PersonOption | null) {
    setHost(person);
    if (!person) return;

    // Здание, кабинет и внутренний телефон подставляем из карточки сотрудника —
    // как selectHostPerson в add-request.js.
    setBuildingId(person.placeId || null);
    setForm((prev) => ({
      ...prev,
      place: person.place ?? prev.place,
      hostPhone: person.phoneInternal ?? prev.hostPhone,
    }));
  }

  const handleIinSearch = async () => {
    if (!iinValid) return;

    setIinSearching(true);
    setIinNotice(null);
    setError(null);

    try {
      const found = await findVisitorByIin(form.iin);

      setForm((prev) => ({
        ...prev,
        lastname: found.lastname ?? "",
        firstname: found.firstname ?? "",
        middleName: found.middleName ?? "",
        organization: found.organization ?? prev.organization,
        mobilePhone: found.mobilePhone ? formatPhone(found.mobilePhone) : "",
      }));

      setIinNotice(found.source === "Gbdfl" ? t("create.iinFoundGbdfl") : t("create.iinFoundLocal"));
    } catch (e) {
      setForm((prev) => ({
        ...prev,
        lastname: "",
        firstname: "",
        middleName: "",
        mobilePhone: "",
      }));
      setError(getErrorMessage(e));
    } finally {
      setIinSearching(false);
    }
  };

  const handleSubmit = async () => {
    setTouched(true);
    setError(null);

    if (
      !iinValid
      || form.lastname.trim() === ""
      || form.firstname.trim() === ""
      || !isPhoneComplete(form.mobilePhone)
      || form.purpose.trim() === ""
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
        mobilePhone: form.mobilePhone.trim(),
        date: form.date,
        timeFrom: form.timeFrom,
        timeTo: form.timeTo,
        hostPersonId: host.id,
        placeId: buildingId,
        place: form.place.trim() || undefined,
        hostPhone: form.hostPhone.trim() || undefined,
        purpose: form.purpose.trim(),
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
        icon={<PersonAddAlt1RoundedIcon />}
        title={t("create.title")}
        busy={saving || iinSearching}
      />
      <ModalBody>
        {error && <Alert color="danger" variant="soft">{error}</Alert>}
        {iinNotice && !error && <Alert color="success" variant="soft">{iinNotice}</Alert>}

        {/* Разбивка на секции и пропорции колонок повторяют AddRequest.cshtml:
            сетка на 12 колонок, span соответствует бутстраповскому col-md-N. */}
        <SectionCard title={t("create.visitorSection")} columns={12}>
          <FormControl size="sm" error={iinError} sx={{ gridColumn: { sm: "span 4" } }}>
            <FormLabel>{t("create.iin")}</FormLabel>
            <Input
              value={form.iin}
              onChange={(e) => set("iin", e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="000000000000"
            />
          </FormControl>

          {/* Кнопка стоит отдельной колонкой рядом с ИИН; пустая подпись — для выравнивания. */}
          <FormControl size="sm" sx={{ gridColumn: { sm: "span 4" } }}>
            <FormLabel>&nbsp;</FormLabel>
            <Button
              size="sm"
              variant="soft"
              color="primary"
              disabled={!iinValid}
              loading={iinSearching}
              onClick={handleIinSearch}
              startDecorator={<SearchRoundedIcon fontSize="small" />}
            >
              {t("create.iinSearch")}
            </Button>
          </FormControl>

          <Box sx={{ display: { xs: "none", sm: "block" }, gridColumn: "span 4" } as const} />

          <FormControl size="sm" error={lastnameError} sx={{ gridColumn: { sm: "span 4" } }}>
            <FormLabel>{t("create.lastname")}</FormLabel>
            <Input value={form.lastname} onChange={(e) => set("lastname", e.target.value)} />
          </FormControl>

          <FormControl size="sm" error={firstnameError} sx={{ gridColumn: { sm: "span 4" } }}>
            <FormLabel>{t("create.firstname")}</FormLabel>
            <Input value={form.firstname} onChange={(e) => set("firstname", e.target.value)} />
          </FormControl>

          <FormControl size="sm" sx={{ gridColumn: { sm: "span 4" } }}>
            <FormLabel>{t("create.middleName")}</FormLabel>
            <Input value={form.middleName} onChange={(e) => set("middleName", e.target.value)} />
          </FormControl>

          <FormControl size="sm" sx={{ gridColumn: { sm: "span 8" } }}>
            <FormLabel>{t("create.organization")}</FormLabel>
            <Autocomplete
              size="sm"
              freeSolo
              loading={orgLoading}
              options={organizations}
              value={form.organization}
              onChange={(_, value) => set("organization", value ?? "")}
              onInputChange={(_, value) => {
                set("organization", value);
                setOrgQuery(value);
              }}
            />
          </FormControl>

          <FormControl size="sm" error={phoneError} sx={{ gridColumn: { sm: "span 4" } }}>
            <FormLabel>{t("create.mobilePhone")}</FormLabel>
            <PhoneInput
              value={form.mobilePhone}
              onChange={(value) => set("mobilePhone", value)}
              error={phoneError}
            />
          </FormControl>
        </SectionCard>

        <SectionCard title={t("create.passCardSection")} columns={12}>
          <FormControl size="sm" sx={{ gridColumn: { sm: "span 6" } }}>
            <FormLabel>{t("create.term")}</FormLabel>
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </FormControl>

          <FormControl size="sm" sx={{ gridColumn: { sm: "span 3" } }}>
            <FormLabel>{t("create.timeFrom")}</FormLabel>
            <Input type="time" value={form.timeFrom} onChange={(e) => set("timeFrom", e.target.value)} />
          </FormControl>

          <FormControl size="sm" sx={{ gridColumn: { sm: "span 3" } }}>
            <FormLabel>{t("create.timeTo")}</FormLabel>
            <Input type="time" value={form.timeTo} onChange={(e) => set("timeTo", e.target.value)} />
          </FormControl>

          <FormControl size="sm" error={purposeError} sx={{ gridColumn: { sm: "span 12" } }}>
            <FormLabel>{t("create.purpose")}</FormLabel>
            <Input value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
          </FormControl>
        </SectionCard>

        <SectionCard title={t("create.hostSection")} columns={12}>
          <FormControl size="sm" error={hostError} sx={{ gridColumn: { sm: "span 4" } }}>
            <FormLabel>{t("create.hostFio")}</FormLabel>
            <Autocomplete
              size="sm"
              placeholder={t("create.hostPlaceholder")}
              loading={hostLoading}
              options={persons}
              value={host}
              getOptionLabel={(option) => option.fio}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                hostTouched.current = true;
                applyHost(value);
              }}
              onInputChange={(_, value, reason) => {
                // reason "reset" — это программная установка значения, не ввод пользователя.
                if (reason !== "reset") hostTouched.current = true;
                setHostQuery(value);
              }}
              renderOption={(props, option) => (
                <AutocompleteOption {...props} key={option.id}>
                  <Box>
                    <Typography level="body-sm">{option.fio}</Typography>
                    <Typography level="body-xs" textColor="text.tertiary">
                      {[
                        option.phoneInternal && `☎ ${option.phoneInternal}`,
                        option.positionName,
                        option.buildingName,
                      ].filter(Boolean).join(" · ")}
                    </Typography>
                  </Box>
                </AutocompleteOption>
              )}
            />
          </FormControl>

          <FormControl size="sm" sx={{ gridColumn: { sm: "span 2" } }}>
            <FormLabel>{t("create.place")}</FormLabel>
            <Input value={form.place} onChange={(e) => set("place", e.target.value)} />
          </FormControl>

          <FormControl size="sm" error={buildingError} sx={{ gridColumn: { sm: "span 3" } }}>
            <FormLabel>{t("create.address")}</FormLabel>
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

          <FormControl size="sm" sx={{ gridColumn: { sm: "span 3" } }}>
            <FormLabel>{t("create.hostPhone")}</FormLabel>
            <Input value={form.hostPhone} onChange={(e) => set("hostPhone", e.target.value)} />
          </FormControl>
        </SectionCard>
      </ModalBody>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmLabel={t("create.submit")}
        loading={saving}
      />
    </>
  );
}
