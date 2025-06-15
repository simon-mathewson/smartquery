import type { Distributable, Os } from './types';

export const currentVersion = '0.0.1';

export const distributablesByOs: Record<Os, Array<Distributable>> = {
  linux: [
    {
      arch: 'x64',
      fileExtension: 'deb',
      fileName: 'dabase-link_0.0.1_amd64.deb',
    },
    {
      arch: 'arm64',
      fileExtension: 'deb',
      fileName: 'dabase-link_0.0.1_arm64.deb',
    },
  ],
  mac: [
    {
      arch: 'x64',
      fileExtension: 'dmg',
      fileName: 'dabase-link_0.0.1_x64.dmg',
    },
    {
      arch: 'arm64',
      fileExtension: 'dmg',
      fileName: 'dabase-link_0.0.1_arm64.dmg',
    },
  ],
  windows: [
    {
      arch: 'x64',
      fileExtension: 'exe',
      fileName: 'dabase-link_0.0.1_x64_setup.exe',
    },
  ],
};
