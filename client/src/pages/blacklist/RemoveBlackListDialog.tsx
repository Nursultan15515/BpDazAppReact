import { useState } from "react";
import Alert from "@mui/joy/Alert";
import Typography from "@mui/joy/Typography";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../app/api";
import { removeFromBlackList } from "../../app/blacklist.api";
import { ModalBody } from "../../components/ModalBody";
import { ModalFooter } from "../../components/ModalFooter";
import { ModalHeader } from "../../components/ModalHeader";
import { ModalGradient } from "../../components/modalGradients";
import { ModalShell } from "../../components/ModalShell";

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
    <ModalShell open={entryId !== null} onClose={onClose} width={480}>
      <ModalHeader
        icon={<DeleteOutlineRoundedIcon />}
        title={t("blacklist.removeTitle", { id: entryId ?? "" })}
        gradient={ModalGradient.danger}
        busy={removing}
      />
      <ModalBody>
        <Typography level="body-sm">{t("blacklist.removeText")}</Typography>
        {error && <Alert color="danger" variant="soft">{error}</Alert>}
      </ModalBody>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handleRemove}
        confirmLabel={t("common.delete")}
        confirmColor="danger"
        loading={removing}
      />
    </ModalShell>
  );
}
