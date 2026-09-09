import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import { useTranslation } from "react-i18next";
import { useMe } from "../app/meContext";
import LanguageSwitcher from "./LanguageSwitcher";

function initials(fio: string): string {
  return fio
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AppUserProfile() {
  const { t } = useTranslation();
  const me = useMe();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <LanguageSwitcher />

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: 0 }}>
        <Avatar size="sm" variant="soft" color="primary">
          {me ? initials(me.fio) : "?"}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-sm" noWrap>
            {me?.fio ?? t("common.loading")}
          </Typography>
          <Typography level="body-xs" noWrap sx={{ color: "text.tertiary" }}>
            {me?.isAdmin ? "admin" : "user"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
