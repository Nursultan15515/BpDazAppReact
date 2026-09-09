import type { ReactNode } from "react";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

/** Пускает дальше только полностью опознанного пользователя. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useAuth();

  if (state.status === "loading") {
    return (
      <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (state.status === "anonymous") return <Navigate to="/login" replace />;
  if (state.status === "needsLink") return <Navigate to="/link" replace />;

  return <>{children}</>;
}

/** Ограничение по роли — замена проверок User.IsInRole в BpDazApp. */
export function RequireRole({
  role,
  children,
  fallback,
}: {
  role: "admin";
  children: ReactNode;
  fallback: ReactNode;
}) {
  const { state } = useAuth();

  if (state.status !== "ready") return null;
  if (role === "admin" && !state.me.isAdmin) return <>{fallback}</>;

  return <>{children}</>;
}
