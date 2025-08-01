export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
  return Intl.NumberFormat('en-US', options).format(value);
};
