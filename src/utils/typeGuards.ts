export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isNonEmptyStringArray(val: unknown): val is string[] {
  return Array.isArray(val) && val.length > 0 && val.every(isString);
}

export function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter(isString);
  if (isString(val)) return [val];
  return [];
}
