export const getBytesUnit = (bytes: number) => {
  if (bytes < 1024) {
    return 'B';
  }
  if (bytes < 1024 * 1024) {
    return 'KB';
  }
  if (bytes < 1024 * 1024 * 1024) {
    return 'MB';
  }
  return 'GB';
};

export const getBytesValue = (bytes: number, unitOverride: 'B' | 'KB' | 'MB' | 'GB') => {
  const unit = unitOverride ?? getBytesUnit(bytes);

  switch (unit) {
    case 'B':
      return bytes.toFixed(Math.ceil(bytes % 1));
    case 'KB': {
      const value = bytes / 1024;
      return value.toFixed(Math.ceil(value % 1));
    }
    case 'MB': {
      const value = bytes / 1024 / 1024;
      return value.toFixed(Math.ceil(value % 1));
    }
    case 'GB': {
      const value = bytes / 1024 / 1024 / 1024;
      return value.toFixed(Math.ceil(value % 1));
    }
  }
};

export const formatBytes = (bytes: number, unitOverride?: 'B' | 'KB' | 'MB' | 'GB') => {
  const unit = unitOverride ?? getBytesUnit(bytes);

  return `${getBytesValue(bytes, unit)} ${unit}`;
};
