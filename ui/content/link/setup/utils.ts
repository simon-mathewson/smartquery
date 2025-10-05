import type { Distributable, Os } from './types';

export const getCurrentOs = (): Os => {
  const platform = window.navigator.platform.toLowerCase();
  if (platform.includes('mac')) return 'mac';
  if (platform.includes('win')) return 'windows';
  return 'linux';
};

export const getDistributableUrl = ({ fileName }: Distributable): string =>
  `${import.meta.env.VITE_LINK_S3_URL}/${fileName}`;

export const getDistributables = (os: Os): Array<Distributable> => {
  const version = import.meta.env.VITE_LINK_VERSION;

  return {
    linux: [
      {
        arch: 'x64',
        fileExtension: 'deb',
        fileName: `smartquery-link_${version}_amd64.deb`,
      },
      {
        arch: 'arm64',
        fileExtension: 'deb',
        fileName: `smartquery-link_${version}_arm64.deb`,
      },
    ],
    mac: [
      {
        arch: 'x64',
        fileExtension: 'dmg',
        fileName: `smartquery-link_${version}_x64.dmg`,
      },
      {
        arch: 'arm64',
        fileExtension: 'dmg',
        fileName: `smartquery-link_${version}_arm64.dmg`,
      },
    ],
    windows: [
      {
        arch: 'x64',
        fileExtension: 'exe',
        fileName: `smartquery-link_${version}_x64_setup.exe`,
      },
    ],
  }[os];
};
