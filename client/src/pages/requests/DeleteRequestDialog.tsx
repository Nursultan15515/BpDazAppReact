import { useState } from "react";
import Alert from "@mui/joy/Alert";
import Typography from "@mui/joy/Typography";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { deleteRequest } from "../../app/requests.api";
import { ModalBody } from "../../components/ModalBody";
import { ModalFooter } from "../../components/ModalFooter";
import { ModalHeader } from "../../components/ModalHeader";
import { ModalGradient } from "../../components/modalGradients";
import { ModalShell } from "../../components/ModalShell";

interface Props {
  requestId: number | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteRequestDialog({ requestId, onClose, onDeleted }: Props) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (requestId === null) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteRequest(requestId);
      onDeleted();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalShell open={requestId !== null} onClose={onClose} width={480}>
      <ModalHeader
        icon={<DeleteOutlineRoundedIcon />}
        title={t("requests.deleteTitle", { id: requestId ?? "" })}
        gradient={ModalGradient.danger}
        busy={deleting}
      />
      <ModalBody>
        <Typography level="body-sm">{t("requests.deleteText")}</Typography>
        {error && <Alert color="danger" variant="soft">{error}</Alert>}
      </ModalBody>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handleDelete}
        confirmLabel={t("common.delete")}
        confirmColor="danger"
        loading={deleting}
      />
    </ModalShell>
  );
}
