import { useEffect, useState } from "react";
import { Paper } from "@mui/material";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { getRequest, type RequestDetails } from "../../app/requests.api";
import { ModalBody } from "../../components/ModalBody";
import { ModalFooter } from "../../components/ModalFooter";
import { ModalHeader } from "../../components/ModalHeader";
import { ModalShell } from "../../components/ModalShell";
import { SectionRow } from "../../components/SectionCard";

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2.5, borderRadius: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200" }}
    >
      <Typography level="title-md" sx={{ mb: 1 }}>{title}</Typography>
      {children}
    </Paper>
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
    <ModalShell open={requestId !== null} onClose={onClose}>
      <ModalHeader
        icon={<AssignmentOutlinedIcon />}
        title={t("details.title", { id: requestId ?? "" })}
        subtitle={details ? t(`status.${details.status}`) : undefined}
        busy={loading}
      />

      <ModalBody>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", minHeight: 200, alignItems: "center" }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert color="danger" variant="soft">{t("details.loadError")}: {error}</Alert>}

        {details && (
          <>
            <Section title={t("details.visitorSection")}>
              <SectionRow label={t("details.fullname")} value={fullname} />
              <SectionRow label={t("details.iin")} value={details.iin} />
              <SectionRow label={t("details.organization")} value={details.organization} />
              <SectionRow label={t("details.mobilePhone")} value={details.mobilePhone} />
            </Section>

            <Section title={t("details.visitSection")}>
              <SectionRow label={t("details.day")} value={formatDay(details.day)} />
              <SectionRow label={t("details.time")} value={`${details.timeFrom} - ${details.timeTo}`} />
              <SectionRow label={t("details.host")} value={details.hostPersonName} />
              <SectionRow label={t("details.hostPhone")} value={details.hostPhone} />
              <SectionRow label={t("details.building")} value={details.hostPlace} />
              <SectionRow label={t("details.place")} value={details.place} />
              <SectionRow label={t("details.card")} value={details.cardNumber} />
              <SectionRow label={t("details.createdAt")} value={new Date(details.date).toLocaleString()} />
              <SectionRow label={t("details.purpose")} value={details.objective} />
            </Section>
          </>
        )}
      </ModalBody>

      <ModalFooter onCancel={onClose} cancelLabel={t("common.close")} />
    </ModalShell>
  );
}
