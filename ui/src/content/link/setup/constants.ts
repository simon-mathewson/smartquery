import type { Distributable, Os } from './types';

export const currentVersion = '0.0.1';

export const distributablesByOs: Record<Os, Array<Distributable>> = {
  linux: [
    {
      arch: 'x64',
      fileExtension: 'deb',
    },
    {
      arch: 'arm64',
      fileExtension: 'deb',
    },
    {
      arch: 'x64',
      fileExtension: 'rpm',
    },
  ],
  mac: [
    {
      arch: 'x64',
      fileExtension: 'dmg',
    },
    {
      arch: 'arm64',
      fileExtension: 'dmg',
    },
  ],
  windows: [
    {
      arch: 'x64',
      fileExtension: 'exe',
    },
  ],
};
