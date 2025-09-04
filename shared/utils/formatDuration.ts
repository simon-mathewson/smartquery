export const getDurationUnit = (milliseconds: number) => {
  if (milliseconds < 1000) {
    return 'ms';
  }
  if (milliseconds < 1000 * 60) {
    return 's';
  }
  if (milliseconds < 1000 * 60 * 60) {
    return 'mins';
  }
  return 'hours';
};

export const getDurationValue = (
  milliseconds: number,
  unitOverride: 'ms' | 's' | 'mins' | 'hours',
) => {
  const unit = unitOverride ?? getDurationUnit(milliseconds);

  switch (unit) {
    case 'ms':
      return milliseconds.toFixed(Math.ceil(milliseconds % 1));
    case 's': {
      const value = milliseconds / 1000;
      return value.toFixed(Math.ceil(value % 1));
    }
    case 'mins': {
      const value = milliseconds / 1000 / 60;
      return value.toFixed(Math.ceil(value % 1));
    }
    case 'hours': {
      const value = milliseconds / 1000 / 60 / 60;
      return value.toFixed(Math.ceil(value % 1));
    }
  }
};

export const formatDuration = (
  milliseconds: number,
  unitOverride?: 'ms' | 's' | 'mins' | 'hours',
) => {
  const unit = unitOverride ?? getDurationUnit(milliseconds);

  const durationValue = getDurationValue(milliseconds, unit);

  const pluralizedUnit = {
    ms: 'ms',
    s: 's',
    mins: durationValue === '1' ? 'min' : 'mins',
    hours: durationValue === '1' ? 'hour' : 'hours',
  }[unit];

  return `${durationValue} ${pluralizedUnit}`;
};
