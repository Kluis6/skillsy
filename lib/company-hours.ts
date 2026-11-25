const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SERVICE_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WESTERN_BRAZIL_TIME_ZONES: Record<string, string> = {
  AC: "America/Rio_Branco",
  AM: "America/Manaus",
  MS: "America/Campo_Grande",
  MT: "America/Cuiaba",
  RO: "America/Porto_Velho",
  RR: "America/Boa_Vista",
};

function toMinutes(hour: string, minute: string | undefined, period: string | undefined) {
  const hours = Number(hour);
  const minutes = minute ? Number(minute) : 0;
  if (minutes > 59 || hours > 24 || (hours === 24 && minutes !== 0)) return null;
  if (!period) return hours * 60 + minutes;
  if (hours < 1 || hours > 12) return null;
  return (hours % 12 + (period === "pm" ? 12 : 0)) * 60 + minutes;
}

export function parseServiceHours(hours: string) {
  const text = hours.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f.]/g, "").trim();
  if (/^24\s*(?:h|horas|hours)$/.test(text)) return { opens: 0, closes: 1440 };

  const time = "(\\d{1,2})(?:(?:\\s*[:h]\\s*)(\\d{2})|\\s*h)?\\s*(am|pm)?";
  const match = text.match(new RegExp(`^(?:das? |de )?${time}\\s*(?:as|ate|a|to|[-–—])\\s*${time}$`));
  if (!match) return null;
  const opens = toMinutes(match[1], match[2], match[3]);
  const closes = toMinutes(match[4], match[5], match[6]);
  if (opens === null || closes === null || opens === 1440 || opens === closes) return null;
  if (Boolean(match[3]) !== Boolean(match[6])) return null;
  return { opens, closes };
}

export function companyTimeZone(state?: string, city?: string) {
  return state === "PE" && city?.trim().toLowerCase() === "fernando de noronha"
    ? "America/Noronha"
    : WESTERN_BRAZIL_TIME_ZONES[state ?? ""] ?? "America/Sao_Paulo";
}

export function isCompanyOpen(
  hours: { opens: number; closes: number },
  serviceDays: readonly string[],
  clock: Intl.DateTimeFormat,
  now: Date,
) {
  const parts = clock.formatToParts(now);
  const weekday = WEEKDAYS.indexOf(parts.find((part) => part.type === "weekday")?.value ?? "");
  const minute = Number(parts.find((part) => part.type === "hour")?.value) * 60
    + Number(parts.find((part) => part.type === "minute")?.value);
  const isScheduledToday = serviceDays.includes(SERVICE_DAYS[weekday]);

  if (hours.opens < hours.closes) {
    return isScheduledToday && minute >= hours.opens && minute < hours.closes;
  }
  const isScheduledYesterday = serviceDays.includes(SERVICE_DAYS[(weekday + 6) % 7]);
  return (isScheduledToday && minute >= hours.opens) || (isScheduledYesterday && minute < hours.closes);
}
