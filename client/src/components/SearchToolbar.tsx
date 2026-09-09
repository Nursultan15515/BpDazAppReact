import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useTranslation } from "react-i18next";

interface Props {
  search: string;
  placeholder: string;
  loading: boolean;
  addLabel?: string;
  onSearchChange: (v: string) => void;
  onApply: () => void;
  onAdd?: () => void;
}

export function SearchToolbar({
  search, placeholder, loading, addLabel, onSearchChange, onApply, onAdd,
}: Props) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
      <FormControl size="sm" sx={{ minWidth: 260 }}>
        <FormLabel>{t("requests.search")}</FormLabel>
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
          startDecorator={<SearchRoundedIcon fontSize="small" />}
        />
      </FormControl>

      <Button size="sm" onClick={onApply} loading={loading} sx={{ alignSelf: "flex-end" }}>
        {t("requests.apply")}
      </Button>

      {onAdd && (
        <Box sx={{ ml: "auto", alignSelf: "flex-end" }}>
          <Button
            size="sm"
            color="success"
            startDecorator={<AddRoundedIcon fontSize="small" />}
            onClick={onAdd}
          >
            {addLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
}
