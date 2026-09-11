import type { SxProps } from "@mui/material/styles";

/**
 * Оформление списков под Kendo UI Grid из BpDazApp — тема Bootstrap, сборка
 * 2017.2.504 (Content/kendo/kendo.common-bootstrap.min.css + kendo.bootstrap.min.css).
 *
 * Значения не подобраны на глаз: старый грид был отрисован в браузере, и цвета,
 * отступы и высоты сняты с него через getComputedStyle. Дробные пиксели —
 * это кендовские .4em/.6em, посчитанные от 14px бутстраповской страницы.
 */
export const kendo = {
  /** Рамка грида, шапки и разделителей колонок. */
  border: "#ccc",
  /** Шапка, чётные строки, пейджер — `.k-header` и `.k-alt`. */
  surface: "#f5f5f5",
  /** Строка под курсором — `.k-grid tr:hover`. */
  hover: "#ebebeb",
  text: "#333",
  /**
   * Цвета `.label` из Bootstrap 3 — на нём построена тема грида, и статусы
   * внутри ячеек красились именно ими.
   */
  labels: {
    default: "#777",
    primary: "#337ab7",
    success: "#5cb85c",
    info: "#5bc0de",
    warning: "#f0ad4e",
    danger: "#d9534f",
  },
} as const;

export type KendoLabelColor = keyof typeof kendo.labels;

/** Рамка вокруг грида: `.k-grid` + общая тень `.k-widget`. */
export const kendoPanelSx: SxProps = {
  borderColor: kendo.border,
  borderRadius: "4px",
  bgcolor: "#fff",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05)",
};

/**
 * Стили самой таблицы. Селекторы намеренно идут через `& thead th` / `& tbody td`:
 * так они перебивают классы MUI, и ячейкам не нужен собственный sx.
 * Обратная сторона — sx на отдельной ячейке отступы уже не переопределит.
 */
export const kendoTableSx: SxProps = {
  color: kendo.text,

  "& th, & td": {
    color: kendo.text,
    fontSize: "14px",
    borderBottom: `1px solid ${kendo.border}`,
    // Вертикальные разделители — главная примета кендо-грида.
    borderLeft: `1px solid ${kendo.border}`,
  },
  "& th:first-of-type, & td:first-of-type": { borderLeft: 0 },

  "& thead th": {
    padding: "7px 8.4px 5.6px",
    bgcolor: kendo.surface,
    // В кендо заголовки обычным начертанием, а не полужирным.
    fontWeight: 400,
    lineHeight: "18px",
    whiteSpace: "nowrap",
    verticalAlign: "bottom",
  },

  "& tbody td": {
    padding: "5.6px 8.4px",
    lineHeight: "22.4px",
    verticalAlign: "middle",
  },

  // Чётные строки серые — `.k-alt`.
  "& tbody tr:nth-of-type(even)": { bgcolor: kendo.surface },
  // Удвоенный `&&` поднимает вес правила: у собственной подсветки MUI
  // (`.MuiTableRow-hover:hover`) специфичность выше обычного селектора.
  "&& tbody tr:hover": { bgcolor: kendo.hover },
};
