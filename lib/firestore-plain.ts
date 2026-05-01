type JsonSerializable<T> = {
  toJSON: () => T;
};

function hasToJSON<T>(value: object): value is JsonSerializable<T> {
  return (
    'toJSON' in value &&
    typeof (value as { toJSON?: unknown }).toJSON === 'function'
  );
}

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

  if (hasToJSON<T>(value)) {
    return toPlainValue(value.toJSON());
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      key,
      toPlainValue(nestedValue),
    ]),
  ) as T;
}
