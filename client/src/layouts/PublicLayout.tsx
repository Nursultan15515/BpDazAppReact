import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

/** Экраны до входа: без сайдбара и breadcrumbs. */
export default function PublicLayout() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        p: 2,
        bgcolor: "background.level1",
      }}
    >
      <Typography level="h3">{t("sidebar.title")}</Typography>

      <Sheet
        variant="outlined"
        sx={{ width: 400, maxWidth: "95vw", borderRadius: "md", p: 3, bgcolor: "background.surface" }}
      >
        <Outlet />
      </Sheet>

      <Box sx={{ width: 200 }}>
        <LanguageSwitcher />
      </Box>

      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
        {t("layout.copyright", { year: new Date().getFullYear() })}
      </Typography>
    </Box>
  );
}
