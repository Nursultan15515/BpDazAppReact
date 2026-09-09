import { useEffect, useState } from "react";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import CircularProgress from "@mui/joy/CircularProgress";
import DialogActions from "@mui/joy/DialogActions";
import DialogContent from "@mui/joy/DialogContent";
import DialogTitle from "@mui/joy/DialogTitle";
import Divider from "@mui/joy/Divider";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { getRequest, type RequestDetails } from "../../app/requests.api";
import { statusColor } from "./helpers";

interface Props {
  requestId: number | null;
  onClose: () => void;
}

interface LoadedState {
  id: number;
  details?: RequestDetails;
  error?: string;
}

/** Бэкенд отдаёт дату визита в ISO — в карточке показываем привычные дд.мм.гггг. */
function formatDay(day: string): string {
  const parts = day.split("-");
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : day;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography level="body-xs" textColor="text.tertiary">{label}</Typography>
      <Typography level="body-sm">{value || t("common.notSet")}</Typography>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Sheet variant="outlined" sx={{ borderRadius: "sm", p: 2 }}>
      <Typography level="title-sm" sx={{ mb: 1.5 }}>{title}</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1.5,
        }}
      >
        {children}
      </Box>
    </Sheet>
  );
}

export function RequestDetailsModal({ requestId, onClose }: Props) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState<LoadedState | null>(null);

  useEffect(() => {
    if (requestId === null) return;

    let cancelled = false;

    getRequest(requestId)
      .then((details) => { if (!cancelled) setLoaded({ id: requestId, details }); })
      .catch((e) => { if (!cancelled) setLoaded({ id: requestId, error: getErrorMessage(e) }); });

    return () => { cancelled = true; };
  }, [requestId]);

  // Пока ответ по текущему id не пришёл, старые данные не показываем.
  const current = loaded?.id === requestId ? loaded : null;
  const details = current?.details ?? null;
  const error = current?.error ?? null;
  const loading = requestId !== null && current === null;

  const fullname = details
    ? [details.lastname, details.firstname, details.middleName].filter(Boolean).join(" ")
    : "";

  return (
    <Modal open={requestId !== null} onClose={onClose}>
      <ModalDialog sx={{ width: 700, maxWidth: "95vw", maxHeight: "90vh" }}>
        <ModalClose />
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {t("details.title", { id: requestId ?? "" })}
          {details && (
            <Chip size="sm" variant="soft" color={statusColor[details.status]}>
              {t(`status.${details.status}`)}
            </Chip>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && <Alert color="danger" variant="soft">{t("details.loadError")}: {error}</Alert>}

          {details && (
            <>
              <Section title={t("details.visitorSection")}>
                <Field label={t("details.fullname")} value={fullname} />
                <Field label={t("details.iin")} value={details.iin} />
                <Field label={t("details.organization")} value={details.organization} />
                <Field label={t("details.mobilePhone")} value={details.mobilePhone} />
              </Section>

              <Section title={t("details.visitSection")}>
                <Field label={t("details.day")} value={formatDay(details.day)} />
                <Field label={t("details.time")} value={`${details.timeFrom} - ${details.timeTo}`} />
                <Field label={t("details.host")} value={details.hostPersonName} />
                <Field label={t("details.hostPhone")} value={details.hostPhone} />
                <Field label={t("details.building")} value={details.hostPlace} />
                <Field label={t("details.place")} value={details.place} />
                <Field label={t("details.card")} value={details.cardNumber} />
                <Field
                  label={t("details.createdAt")}
                  value={new Date(details.date).toLocaleString()}
                />
                <Box sx={{ gridColumn: { sm: "span 2" } }}>
                  <Field label={t("details.purpose")} value={details.objective} />
                </Box>
              </Section>
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button variant="plain" color="neutral" onClick={onClose}>
            {t("common.close")}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
