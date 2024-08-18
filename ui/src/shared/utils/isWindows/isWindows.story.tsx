import { getIsWindows } from './isWindows';

export const IsWindowsStory: React.FC = () => {
  const isWindows = getIsWindows();

  return String(isWindows);
};
