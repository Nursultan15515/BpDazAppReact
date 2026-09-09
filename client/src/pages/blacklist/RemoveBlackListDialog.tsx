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
import { removeFromBlackList } from "../../app/blacklist.api";

interface Props {
  entryId: number | null;
  onClose: () => void;
  onRemoved: () => void;
}

export function RemoveBlackListDialog({ entryId, onClose, onRemoved }: Props) {
  const { t } = useTranslation();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (entryId === null) return;

    setRemoving(true);
    setError(null);
    try {
      await removeFromBlackList(entryId);
      onRemoved();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Modal open={entryId !== null} onClose={onClose}>
      <ModalDialog variant="outlined" role="alertdialog" sx={{ maxWidth: 440 }}>
        <DialogTitle>
          <WarningRoundedIcon color="warning" />
          {t("blacklist.removeTitle", { id: entryId ?? "" })}
        </DialogTitle>
        <Divider />
        <DialogContent>
          {t("blacklist.removeText")}
          {error && <Alert color="danger" variant="soft" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button color="danger" onClick={handleRemove} loading={removing}>
            {t("common.delete")}
          </Button>
          <Button variant="plain" color="neutral" onClick={onClose} disabled={removing}>
            {t("common.cancel")}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
