import { useState } from "react";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useTranslation } from "react-i18next";
import { pageSizeOptions } from "../app/paging";

interface Props {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/** Сколько номеров показываем целиком, без многоточий. */
const MaxPlainPages = 7;

/** Номера кнопок: 1 … 4 5 [6] 7 8 … 20. Первая и последняя видны всегда. */
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= MaxPlainPages) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "gap")[] = [1];

  if (current > 4) pages.push("gap");
  for (let n = Math.max(2, current - 2); n <= Math.min(total - 1, current + 2); n++) pages.push(n);
  if (current < total - 3) pages.push("gap");

  pages.push(total);
  return pages;
}

/**
 * Панель пагинации под таблицей. Оформление и логика номеров взяты из
 * PassBureau, но размер страницы и её номер меняются разными колбэками —
 * иначе выбор размера дёргал бы загрузку дважды.
 */
export function Pagination({
  page, pageSize, totalCount, totalPages, onPageChange, onPageSizeChange,
}: Props) {
  const { t } = useTranslation();
  const [jump, setJump] = useState("");

  if (totalCount === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalCount);

  const goToJump = () => {
    const target = Number.parseInt(jump, 10);
    if (target >= 1 && target <= totalPages) {
      onPageChange(target);
      setJump("");
    }
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: "sm",
        px: 1.5,
        py: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography level="body-xs" textColor="text.secondary">
            {t("pagination.rowsPerPage")}
          </Typography>
          <Select
            size="sm"
            value={pageSize}
            onChange={(_, value) => value && onPageSizeChange(value)}
            sx={{ minWidth: 76 }}
          >
            {pageSizeOptions.map((size) => (
              <Option key={size} value={size}>{size}</Option>
            ))}
          </Select>
        </Stack>

        <Typography level="body-xs" textColor="text.secondary">
          {t("pagination.range", { first, last, total: totalCount })}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          aria-label={t("pagination.prev")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>

        {pageNumbers(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <Typography
              key={`gap-${index}`}
              level="body-sm"
              sx={{ px: 0.5, color: "text.tertiary" }}
            >
              …
            </Typography>
          ) : (
            <IconButton
              key={item}
              size="sm"
              variant={item === page ? "solid" : "outlined"}
              color={item === page ? "primary" : "neutral"}
              onClick={() => onPageChange(item)}
              sx={{ minWidth: 32 }}
            >
              {item}
            </IconButton>
          )
        )}

        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          aria-label={t("pagination.next")}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightRoundedIcon />
        </IconButton>

        {/* Пока номеров мало, они все на виду — поле перехода лишнее. */}
        {totalPages > MaxPlainPages && (
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ ml: 1 }}>
            <Typography level="body-xs" textColor="text.secondary">
              {t("pagination.jump")}
            </Typography>
            <Input
              size="sm"
              value={jump}
              placeholder={t("pagination.jumpPlaceholder")}
              onChange={(e) => setJump(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToJump()}
              slotProps={{ input: { type: "number", min: 1, max: totalPages } }}
              sx={{ width: 78 }}
            />
            <Button size="sm" variant="outlined" color="neutral" onClick={goToJump}>→</Button>
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
}
