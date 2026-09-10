import Input from "@mui/joy/Input";
import { formatPhone, isPhoneComplete } from "../app/phone";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

/**
 * Поле телефона с маской. Поведение взято из add-request.js в BpDazApp:
 * при фокусе подставляется «+7(», Backspace перескакивает разделители,
 * а при уходе из недозаполненного поля значение стирается.
 */
export function PhoneInput({ value, onChange, error }: Props) {
  return (
    <Input
      value={value}
      error={error}
      onChange={(e) => onChange(formatPhone(e.target.value))}
      onFocus={(e) => {
        if (!e.target.value) onChange("+7(");
      }}
      onBlur={(e) => {
        if (!isPhoneComplete(e.target.value)) onChange("");
      }}
      onKeyDown={(e) => {
        if (e.key !== "Backspace") return;

        const input = e.currentTarget.querySelector("input") ?? (e.target as HTMLInputElement);
        if (input.selectionStart !== input.selectionEnd) return;

        const pos = input.selectionStart ?? 0;
        if (pos === 0) return;

        // Разделители маски удалять нечего — просто перескакиваем через них.
        const prevChar = input.value.charAt(pos - 1);
        if (prevChar === "-" || prevChar === ")" || prevChar === "(" || prevChar === " ") {
          e.preventDefault();
          input.setSelectionRange(pos - 1, pos - 1);
        }
      }}
      placeholder="+7(___)___-__-__"
    />
  );
}
