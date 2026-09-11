import { TableCell, TableRow } from "@mui/material";
import Box from "@mui/joy/Box";

interface Props {
  colSpan: number;
  text: string;
}

/**
 * Строка «ничего не найдено». Воздух задаёт вложенный Box, а не sx ячейки:
 * отступы ячеек приходят из kendoTableSx и перебивают собственный sx клетки.
 */
export function TableEmptyRow({ colSpan, text }: Props) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center">
        <Box sx={{ py: 5, color: "text.secondary" }}>{text}</Box>
      </TableCell>
    </TableRow>
  );
}
