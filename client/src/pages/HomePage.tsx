import { useState } from "react";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../app/authContext";
import { CreateRequestDialog } from "./requests/CreateRequestDialog";

interface TileProps {
  icon: React.ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
}

function Tile({ icon, title, hint, onClick }: TileProps) {
  return (
    <Sheet
      variant="outlined"
      onClick={onClick}
      sx={{
        borderRadius: "sm",
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": {
          borderColor: "primary.outlinedBorder",
          boxShadow: "sm",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: "sm",
          bgcolor: "primary.softBg",
          color: "primary.plainColor",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography level="title-sm">{title}</Typography>
        <Typography level="body-xs" textColor="text.tertiary">{hint}</Typography>
      </Box>
    </Sheet>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const me = useMe();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, maxWidth: 900 }}>
      <Box>
        <Typography level="h3">
          {me ? t("home.greeting", { name: me.fio }) : t("sidebar.title")}
        </Typography>
        <Typography level="body-sm" textColor="text.tertiary">
          {t("home.subtitle")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <Tile
          icon={<PersonAddAlt1RoundedIcon />}
          title={t("home.invite")}
          hint={t("home.inviteHint")}
          onClick={() => setCreateOpen(true)}
        />
        <Tile
          icon={<FormatListBulletedIcon />}
          title={t("home.allRequests")}
          hint={t("home.allRequestsHint")}
          onClick={() => navigate("/requests")}
        />
        <Tile
          icon={<AssignmentIndOutlinedIcon />}
          title={t("home.myRequests")}
          hint={t("home.myRequestsHint")}
          onClick={() => navigate("/my-requests")}
        />
      </Box>

      <CreateRequestDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          navigate("/my-requests");
        }}
      />
    </Box>
  );
}
