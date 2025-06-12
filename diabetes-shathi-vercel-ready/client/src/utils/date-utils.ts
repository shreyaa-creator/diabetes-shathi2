import { format, isToday, isYesterday, differenceInDays } from "date-fns";

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  
  if (isToday(d)) {
    return "আজ";
  } else if (isYesterday(d)) {
    return "গতকাল";
  } else {
    return format(d, "dd/MM/yyyy");
  }
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return format(d, "hh:mm a");
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function getDaysSince(date: Date | string): number {
  return differenceInDays(new Date(), new Date(date));
}

export function getTimeAgo(date: Date | string): string {
  const days = getDaysSince(date);
  
  if (days === 0) {
    return "আজ";
  } else if (days === 1) {
    return "গতকাল";
  } else if (days < 7) {
    return `${days} দিন আগে`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} সপ্তাহ আগে`;
  } else {
    const months = Math.floor(days / 30);
    return `${months} মাস আগে`;
  }
}
