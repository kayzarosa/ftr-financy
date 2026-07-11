export function serializeDate(value: Date | number | string): string {
  return new Date(value).toISOString();
}
