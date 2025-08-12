export const formatDuration = (milliseconds: number) => {
  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }
  if (milliseconds < 1000 * 60) {
    return `${(milliseconds / 1000).toFixed(0)} s`;
  }
  if (milliseconds < 1000 * 60 * 60) {
    return `${(milliseconds / 1000 / 60).toFixed(0)} mins`;
  }
  return `${(milliseconds / 1000 / 60 / 60).toFixed(0)} hours`;
};
