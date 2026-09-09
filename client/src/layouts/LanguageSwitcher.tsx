import { useTranslation } from "react-i18next";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

// ── Inline SVG flags ──────────────────────────────────────────────────────────

function FlagKZ() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width="20" height="14" style={{ display: "block", borderRadius: 2 }}>
      <rect width="20" height="14" fill="#00AFCA" />
      <rect x="0" y="0" width="2.2" height="14" fill="#FFD700" opacity="0.9" />
      <circle cx="11" cy="7" r="2.2" fill="#FFD700" />
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16;
        const rad = (angle * Math.PI) / 180;
        const x1 = 11 + Math.cos(rad) * 2.6;
        const y1 = 7 + Math.sin(rad) * 2.6;
        const x2 = 11 + Math.cos(rad) * 3.4;
        const y2 = 7 + Math.sin(rad) * 3.4;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD700" strokeWidth="0.5" />;
      })}
      <path d="M9.5 4.5 Q11 3 12.5 4.5 Q11 5.5 9.5 4.5Z" fill="#FFD700" opacity="0.85" />
    </svg>
  );
}

function FlagRU() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width="20" height="14" style={{ display: "block", borderRadius: 2 }}>
      <rect width="20" height="14" fill="#fff" />
      <rect y="4.67" width="20" height="4.66" fill="#0039A6" />
      <rect y="9.33" width="20" height="4.67" fill="#D52B1E" />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width="20" height="14" style={{ display: "block", borderRadius: 2 }}>
      <rect width="20" height="14" fill="#012169" />
      <line x1="0" y1="0" x2="20" y2="14" stroke="#fff" strokeWidth="3" />
      <line x1="20" y1="0" x2="0" y2="14" stroke="#fff" strokeWidth="3" />
      <line x1="0" y1="0" x2="20" y2="14" stroke="#C8102E" strokeWidth="1.6" />
      <line x1="20" y1="0" x2="0" y2="14" stroke="#C8102E" strokeWidth="1.6" />
      <rect x="8.5" y="0" width="3" height="14" fill="#fff" />
      <rect x="0" y="5.5" width="20" height="3" fill="#fff" />
      <rect x="9" y="0" width="2" height="14" fill="#C8102E" />
      <rect x="0" y="6" width="20" height="2" fill="#C8102E" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const LANGS = [
  { code: "kk", label: "Қазақша", Flag: FlagKZ },
  { code: "en", label: "English", Flag: FlagGB },
  { code: "ru", label: "Русский", Flag: FlagRU },
] as const;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (_: unknown, code: string | null) => {
    if (!code) return;
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
  };

  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0];

  return (
    <Select
      size="sm"
      value={i18n.language}
      onChange={handleChange}
      renderValue={() => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <current.Flag />
          <Typography level="body-sm">{current.label}</Typography>
        </Box>
      )}
      indicator={<KeyboardArrowDown />}
      sx={{
        [`& .${selectClasses.indicator}`]: {
          transition: "0.2s",
          [`&.${selectClasses.expanded}`]: { transform: "rotate(-180deg)" },
        },
      }}
    >
      {LANGS.map(({ code, label, Flag }) => (
        <Option key={code} value={code}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Flag />
            <Typography level="body-sm">{label}</Typography>
          </Box>
        </Option>
      ))}
    </Select>
  );
}
