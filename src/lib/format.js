export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return String(date);
}

export function dateValue(date) {
  if (date instanceof Date) return date.getTime();
  if (typeof date === "string") {
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  }
  return 0;
}

