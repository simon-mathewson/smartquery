import { currentVersion } from './constants';
import type { Distributable, Os } from './types';

export const getCurrentOs = (): Os => {
  const platform = window.navigator.platform.toLowerCase();
  if (platform.includes('mac')) return 'mac';
  if (platform.includes('win')) return 'windows';
  return 'linux';
};

export const getDistributableUrl = ({ arch, fileExtension }: Distributable): string =>
  `${import.meta.env.VITE_LINK_S3_URL}/dabase-link_${currentVersion}_${arch}${
    fileExtension === 'exe' ? '_setup.exe' : `.${fileExtension}`
  }`;
