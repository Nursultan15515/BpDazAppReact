import { useState } from "react";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../app/api";
import { useAuth } from "../app/authContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const { state, signIn } = useAuth();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.status === "ready") return <Navigate to="/" replace />;
  if (state.status === "needsLink") return <Navigate to="/link" replace />;

  // В доменном режиме формы входа нет: пользователя опознаёт Windows.
  const passwordDisabled = state.status === "anonymous" && state.authMode === "Windows";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (login.trim() === "" || password === "") {
      setError(t("login.fillBoth"));
      return;
    }

    setSubmitting(true);
    try {
      await signIn(login.trim(), password);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography level="title-lg">{t("login.title")}</Typography>

      {passwordDisabled && (
        <Alert color="warning" variant="soft">{t("login.windowsOnly")}</Alert>
      )}

      {error && <Alert color="danger" variant="soft">{error}</Alert>}

      <FormControl size="sm">
        <FormLabel>{t("login.login")}</FormLabel>
        <Input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
          disabled={passwordDisabled}
          autoFocus
        />
      </FormControl>

      <FormControl size="sm">
        <FormLabel>{t("login.password")}</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={passwordDisabled}
        />
      </FormControl>

      <Button type="submit" loading={submitting} disabled={passwordDisabled}>
        {t("login.submit")}
      </Button>
    </Box>
  );
}
