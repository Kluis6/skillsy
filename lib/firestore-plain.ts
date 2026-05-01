export function toPlainValue<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPlainValue(item)) as T;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (
    'toJSON' in (value as object) &&
    typeof (value as { toJSON?: unknown }).toJSON === 'function'
  ) {
    return toPlainValue((value as { toJSON: () => T }).toJSON());
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      key,
      toPlainValue(nestedValue),
    ]),
  ) as T;
}
