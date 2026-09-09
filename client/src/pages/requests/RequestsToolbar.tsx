import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import { useTranslation } from "react-i18next";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import type { RequestFilterMode } from "../../app/requests.api";

interface Props {
  mode: RequestFilterMode;
  dateFrom: string;
  dateTo: string;
  search: string;
  loading: boolean;
  onModeChange: (v: RequestFilterMode) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onApply: () => void;
  onCreate: () => void;
}

const MODES: RequestFilterMode[] = ["All", "InBuilding", "Left"];

const modeLabelKey: Record<RequestFilterMode, string> = {
  All: "requests.filterAll",
  InBuilding: "requests.filterInBuilding",
  Left: "requests.filterLeft",
};

export function RequestsToolbar({
  mode, dateFrom, dateTo, search, loading,
  onModeChange, onDateFromChange, onDateToChange, onSearchChange, onApply, onCreate,
}: Props) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0, alignSelf: "flex-end", pb: 0.25 }}>
        {MODES.map((m) => (
          <Button
            key={m}
            size="sm"
            variant={mode === m ? "solid" : "outlined"}
            color={mode === m ? "primary" : "neutral"}
            onClick={() => onModeChange(m)}
          >
            {t(modeLabelKey[m])}
          </Button>
        ))}
      </Box>

      <FormControl size="sm" sx={{ minWidth: 200 }}>
        <FormLabel>{t("requests.search")}</FormLabel>
        <Input
          placeholder={t("requests.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          startDecorator={<SearchRoundedIcon fontSize="small" />}
        />
      </FormControl>

      <FormControl size="sm">
        <FormLabel>{t("requests.dateFrom")}</FormLabel>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          slotProps={{ input: { max: dateTo || undefined } }}
        />
      </FormControl>

      <FormControl size="sm">
        <FormLabel>{t("requests.dateTo")}</FormLabel>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          slotProps={{ input: { min: dateFrom || undefined } }}
        />
      </FormControl>

      <Button size="sm" onClick={onApply} loading={loading} sx={{ alignSelf: "flex-end" }}>
        {t("requests.apply")}
      </Button>

      <Box sx={{ ml: "auto", alignSelf: "flex-end" }}>
        <Button
          size="sm"
          color="success"
          startDecorator={<AddRoundedIcon fontSize="small" />}
          onClick={onCreate}
        >
          {t("requests.create")}
        </Button>
      </Box>
    </Box>
  );
}
