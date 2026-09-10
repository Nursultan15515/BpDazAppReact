import type { RequestStatus } from "../../app/requests.api";

type ChipColor = "primary" | "neutral" | "success" | "warning" | "danger";

export const statusColor: Record<RequestStatus, ChipColor> = {
  Default: "neutral",
  Decorated: "primary",
  Current: "success",
  Overdue: "danger",
  Done: "neutral",
  CardTaken: "warning",
};

/** Текущее время в формате input[type=time] — как ViewBag.NowTime в BpDazApp. */
export function nowTime(): string {
  const date = new Date();
  return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
}

/** Дата в формате input[type=date] со сдвигом в днях от сегодня. */
export function isoDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}
