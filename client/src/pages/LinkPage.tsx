import { useState } from "react";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../app/api";
import { useAuth } from "../app/authContext";

/**
 * Доменного пользователя Windows опознала, но в базе бюро пропусков его нет.
 * Он вводит свой логин, и учётка привязывается — как SetAccountNameByLogin в BpDazApp.
 */
export default function LinkPage() {
  const { t } = useTranslation();
  const { state, link, signOut } = useAuth();

  const [login, setLogin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.status === "ready") return <Navigate to="/" replace />;
  if (state.status === "anonymous") return <Navigate to="/login" replace />;
  if (state.status === "loading") return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (login.trim() === "") {
      setError(t("link.fillLogin"));
      return;
    }

    setSubmitting(true);
    try {
      await link(login.trim());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography level="title-lg">{t("link.title")}</Typography>

      <Typography level="body-sm" textColor="text.secondary">
        {t("link.description", { account: state.accountName })}
      </Typography>

      {error && <Alert color="danger" variant="soft">{error}</Alert>}

      <FormControl size="sm">
        <FormLabel>{t("link.login")}</FormLabel>
        <Input value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
        <FormHelperText>{t("link.loginHint")}</FormHelperText>
      </FormControl>

      <Button type="submit" loading={submitting}>{t("link.submit")}</Button>
      <Button variant="plain" color="neutral" onClick={() => signOut()} disabled={submitting}>
        {t("login.logout")}
      </Button>
    </Box>
  );
}
