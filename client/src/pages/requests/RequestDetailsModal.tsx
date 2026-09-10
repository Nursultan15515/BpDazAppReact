import { useEffect, useState } from "react";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { getRequest, requestPhotoUrl, type RequestDetails } from "../../app/requests.api";
import { ModalBody } from "../../components/ModalBody";
import { ModalFooter } from "../../components/ModalFooter";
import { ModalHeader } from "../../components/ModalHeader";
import { ModalShell } from "../../components/ModalShell";
import { SectionCard, SectionRow } from "../../components/SectionCard";

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

/** Момент оформления — без секунд, как в карточках PassBureau. */
function formatMoment(value: string): string {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

/** Ширина снимка; пропорция 3:4 — как 135×180 в BpDazApp и 160×213 в PassBureau. */
const PhotoWidth = 160;

/**
 * Фото посетителя, снятое на посту при выдаче карты. Пустой photoId означает,
 * что снимка нет, — тогда запрос не отправляем вовсе. Ошибку загрузки тоже
 * показываем заглушкой: файл может лежать на диске, а не в таблице.
 */
function VisitorPhoto({ requestId, photoId }: { requestId: number; photoId: string | null }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  return (
    <Box
      sx={{
        width: PhotoWidth,
        aspectRatio: "3 / 4",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.level1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        flexShrink: 0,
        alignSelf: "flex-end",
      }}
    >
      {photoId && !failed ? (
        <Box
          component="img"
          src={requestPhotoUrl(requestId)}
          alt={t("details.photo")}
          onError={() => setFailed(true)}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <>
          <PersonOutlineRoundedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography level="body-xs" textColor="text.tertiary">
            {t("details.noPhoto")}
          </Typography>
        </>
      )}
    </Box>
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
            {/* Данные посетителя и его фото стоят рядом — вёрстка из VisitorDetailModal
                PassBureau. Строки внутри идут в столбик, поэтому раскладываем их в две
                колонки: иначе карточка вытягивается вдвое и уезжает под скролл. */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                gap: 1.5,
              }}
            >
              <SectionCard title={t("details.visitorSection")}>
                <SectionRow label={t("details.fullname")} value={fullname} span={2} />
                <SectionRow label={t("details.iin")} value={details.iin} />
                <SectionRow label={t("details.mobilePhone")} value={details.mobilePhone} />
                <SectionRow label={t("details.organization")} value={details.organization} span={2} />
              </SectionCard>

              <VisitorPhoto key={details.id} requestId={details.id} photoId={details.photoId} />
            </Box>

            <SectionCard title={t("details.visitSection")}>
              <SectionRow label={t("details.day")} value={formatDay(details.day)} />
              <SectionRow label={t("details.time")} value={`${details.timeFrom} - ${details.timeTo}`} />
              <SectionRow label={t("details.host")} value={details.hostPersonName} />
              <SectionRow label={t("details.hostPhone")} value={details.hostPhone} />
              <SectionRow label={t("details.building")} value={details.hostPlace} />
              <SectionRow label={t("details.place")} value={details.place} />
              <SectionRow label={t("details.card")} value={details.cardNumber} />
              <SectionRow label={t("details.createdAt")} value={formatMoment(details.date)} />
              <SectionRow label={t("details.purpose")} value={details.objective} span={2} />
            </SectionCard>
          </>
        )}
      </ModalBody>

      <ModalFooter onCancel={onClose} cancelLabel={t("common.close")} />
    </ModalShell>
  );
}
