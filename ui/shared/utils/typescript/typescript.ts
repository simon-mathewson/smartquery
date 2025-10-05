export const isNotNull = <T>(value: T | null): value is T => value !== null;

export const isNotUndefined = <T>(value: T | undefined): value is T => value !== undefined;
