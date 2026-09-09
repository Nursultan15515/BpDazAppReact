import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useTranslation } from "react-i18next";
import { useAuth, useMe } from "../app/authContext";
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
  const { signOut } = useAuth();
  const me = useMe();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <LanguageSwitcher />

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: 0 }}>
        <Avatar size="sm" variant="soft" color="primary">
          {me ? initials(me.fio) : "?"}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm" noWrap>
            {me?.fio || me?.login || t("common.loading")}
          </Typography>
          <Typography level="body-xs" noWrap sx={{ color: "text.tertiary" }}>
            {me?.isAdmin ? t("users.roleAdmin") : t("users.roleUser")}
          </Typography>
        </Box>
        <Tooltip title={t("login.logout")}>
          <IconButton size="sm" variant="plain" color="neutral" onClick={() => signOut()}>
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
