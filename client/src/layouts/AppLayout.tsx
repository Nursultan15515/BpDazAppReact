import { Outlet } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar";
import AppBreadcrumbs from "./AppBreadcrumbs";

const drawerWidth = 240;
const appBarHeight = 40;
const footerHeight = 36;

export default function AppLayout() {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
      <Sidebar />
      {/* Фиксированная шапка с breadcrumbs */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          height: `${appBarHeight}px`,
          display: "flex",
          alignItems: "center",
          bgcolor: "background.default",
          borderBottom: "1px solid rgba(0,0,0,0.12)",
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      >
        <AppBreadcrumbs />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          pt: `${appBarHeight}px`,
          pb: `${footerHeight}px`,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          left: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          height: `${footerHeight}px`,
          bgcolor: "#f3f4f6",
          borderTop: "1px solid rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("layout.copyright", { year: new Date().getFullYear() })}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("layout.developer")}
        </Typography>
      </Box>
    </Box>
  );
}
