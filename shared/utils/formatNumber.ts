export const getNumberUnit = (number: number) => {
  if (number < 1_000) {
    return null;
  }
  if (number < 1_000_000) {
    return 'k';
  }
  if (number < 1_000_000_000) {
    return 'm';
  }
  if (number < 1_000_000_000_000) {
    return 'b';
  }
  return 't';
};

export const getNumberValue = (number: number, unitOverride: 'k' | 'm' | 'b' | 't' | null) => {
  const unit = unitOverride ?? getNumberUnit(number);

  switch (unit) {
    case null:
      return number.toFixed(Math.ceil(number % 1));
    case 'k': {
      const value = number / 1_000;
      return value.toFixed(Math.ceil(value % 1));
    }
    case 'm': {
      const value = number / 1_000_000;
      return value.toFixed(Math.ceil(value % 1));
    }
    case 'b': {
      const value = number / 1_000_000_000;
      return value.toFixed(Math.ceil(value % 1));
    }
    case 't': {
      const value = number / 1_000_000_000_000;
      return value.toFixed(Math.ceil(value % 1));
    }
  }
};

export const formatNumber = (number: number, unitOverride?: null | 'k' | 'm' | 'b' | 't') => {
  const unit = unitOverride ?? getNumberUnit(number);

  return `${getNumberValue(number, unit)}${unit ?? ''}`;
};
