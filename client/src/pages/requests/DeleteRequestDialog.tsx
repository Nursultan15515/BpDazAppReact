import { useState } from "react";
import Alert from "@mui/joy/Alert";
import Button from "@mui/joy/Button";
import DialogActions from "@mui/joy/DialogActions";
import DialogContent from "@mui/joy/DialogContent";
import DialogTitle from "@mui/joy/DialogTitle";
import Divider from "@mui/joy/Divider";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { deleteRequest } from "../../app/requests.api";

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
    <Modal open={requestId !== null} onClose={onClose}>
      <ModalDialog variant="outlined" role="alertdialog" sx={{ maxWidth: 420 }}>
        <DialogTitle>
          <WarningRoundedIcon color="warning" />
          {t("requests.deleteTitle", { id: requestId ?? "" })}
        </DialogTitle>
        <Divider />
        <DialogContent>
          {t("requests.deleteText")}
          {error && <Alert color="danger" variant="soft" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button color="danger" onClick={handleDelete} loading={deleting}>
            {t("common.delete")}
          </Button>
          <Button variant="plain" color="neutral" onClick={onClose} disabled={deleting}>
            {t("common.cancel")}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
