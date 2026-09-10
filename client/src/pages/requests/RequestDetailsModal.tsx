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
import { CardWidth } from "../../components/modalSizes";
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
 *
 * В оригинале снимок стоял в col-md-2 внутри секции, но там поля были
 * инпутами во всю ширину. У нас значения короткие, и снимок, растянутый на
 * три ряда сетки, раздвигал их дырами — поэтому ставим его рядом со всей
 * секцией, как в VisitorDetailModal у PassBureau.
 */
function VisitorPhoto({ requestId, photoId }: { requestId: number; photoId: string | null }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  return (
    <Box
      sx={{
        width: PhotoWidth,
        aspectRatio: "3 / 4",
        flexShrink: 0,
        // По центру, а не по нижнему краю: иначе сверху справа зияет пустой угол.
        alignSelf: "center",
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

  return (
    <ModalShell open={requestId !== null} onClose={onClose} width={CardWidth}>
      <ModalHeader
        icon={<AssignmentOutlinedIcon />}
        title={t("details.title", { id: requestId ?? "" })}
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
            {/* Три секции и пропорции колонок повторяют окно «Дополнительная
                информация о пропуске» из BpDazApp (ViewRequest.cshtml), оформление —
                из PassBureau. Числа span — это col-md-N оригинала. */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "stretch" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Пропорции оригинала (10+2, 8+4) держались на рамках инпутов;
                    у нас значения короткие, и разные отступы читаются ступеньками.
                    Поэтому здесь одна пара колонок на все ряды. */}
                <SectionCard title={t("create.visitorSection")}>
                  <SectionRow label={t("create.iin")} value={details.iin} />
                  <SectionRow label={t("details.createdAt")} value={formatMoment(details.date)} />
                  <SectionRow label={t("create.lastname")} value={details.lastname} />
                  <SectionRow label={t("create.firstname")} value={details.firstname} />
                  <SectionRow label={t("create.middleName")} value={details.middleName} />
                  <SectionRow label={t("details.card")} value={details.cardNumber} />
                  <SectionRow label={t("create.organization")} value={details.organization} />
                  <SectionRow label={t("create.mobilePhone")} value={details.mobilePhone} />
                </SectionCard>
              </Box>

              <VisitorPhoto key={details.id} requestId={details.id} photoId={details.photoId} />
            </Box>

            <SectionCard title={t("create.passCardSection")} columns={12}>
              <SectionRow label={t("details.status")} value={t(`status.${details.status}`)} span={3} />
              <SectionRow label={t("details.day")} value={formatDay(details.day)} span={3} />
              <SectionRow label={t("details.timeFrom")} value={details.timeFrom} span={3} />
              <SectionRow label={t("details.timeTo")} value={details.timeTo} span={3} />
              <SectionRow label={t("create.purpose")} value={details.objective} span={12} />
            </SectionCard>

            <SectionCard title={t("create.hostSection")} columns={12}>
              <SectionRow label={t("create.hostFio")} value={details.hostPersonName} span={4} />
              {/* Кабинета в оригинальном окне просмотра не было, но он есть в форме
                  создания и нужен на посту — оставляем, как в нашей AddRequest. */}
              <SectionRow label={t("create.place")} value={details.place} span={2} />
              <SectionRow label={t("create.address")} value={details.hostPlace} span={3} />
              <SectionRow label={t("create.hostPhone")} value={details.hostPhone} span={3} />
            </SectionCard>
          </>
        )}
      </ModalBody>

      <ModalFooter onCancel={onClose} cancelLabel={t("common.close")} />
    </ModalShell>
  );
}
