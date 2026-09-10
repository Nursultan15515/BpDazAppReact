/**
 * Маска мобильного телефона +7(XXX)XXX-XX-XX.
 * Повторяет formatPhone из Scripts/add-request.js в BpDazApp.
 */
export function formatPhone(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "");

  if (digits && digits.charAt(0) !== "7") {
    digits = `7${digits}`;
  }

  digits = digits.substring(0, 11);

  if (!digits) return "";

  let res = "+7(";

  if (digits.length > 1) {
    res += digits.substring(1, Math.min(4, digits.length));
  }

  if (digits.length >= 4) {
    res += ")";
    res += digits.substring(4, Math.min(7, digits.length));
  }

  if (digits.length >= 7) {
    res += `-${digits.substring(7, Math.min(9, digits.length))}`;
  }

  if (digits.length >= 9) {
    res += `-${digits.substring(9, Math.min(11, digits.length))}`;
  }

  return res;
}

export function phoneDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

/** Номер считается заполненным, когда набраны все 11 цифр. */
export function isPhoneComplete(value: string): boolean {
  return phoneDigits(value).length === 11;
}
