import { DayCode } from "../types.js";
import { DAY_LABELS } from "./constants.js";

export const pad = (value: number) => value.toString().padStart(2, "0");

export const parseTimeToMinutes = (time: string) => {
  if (!time) return Number.NaN;
  const parts = time.split(":");
  if (parts.length < 2) return Number.NaN;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.NaN;
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

export const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const isoForDateMinutes = (date: Date, minutes: number) => `${formatDate(date)}T${minutesToTime(minutes)}:00-03:00`;

export const isValidDayCode = (value: string): value is DayCode => DAY_LABELS.includes(value as DayCode);

export const parseDays = (input: unknown): DayCode[] => {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => String(item || "").toUpperCase())
    .filter((value) => isValidDayCode(value)) as DayCode[];
};
