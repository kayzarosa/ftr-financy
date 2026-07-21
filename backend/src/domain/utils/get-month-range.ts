export function getMonthRange(month: string) {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  return { start: new Date(year, monthIndex, 1), end: new Date(year, monthIndex + 1, 1) };
}