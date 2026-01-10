import { DESKTOP_S3_URL, DESKTOP_VERSION } from '@/constants';

export type Os = 'debian' | 'ios' | 'macos' | 'windows';
export type Arch = 'x64' | 'arm64' | 'universal';

export const detectOS = async (): Promise<{
  os: Os;
  arch: Arch;
} | null> => {
  const ua = navigator.userAgent.toLowerCase();

  let architecture = null;

  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const hints = await navigator.userAgentData.getHighEntropyValues(['architecture']);
      architecture = hints.architecture;
      // eslint-disable-next-line no-empty
    } catch {}
  }

  const isArm = () => (architecture && /arm/.test(architecture)) || /arm|aarch64/.test(ua);

  const isAmd = () =>
    (architecture && /86/.test(architecture)) || /x86_64|amd64|x64|win64|wow64|i[3-6]86/.test(ua);

  function archResultMac() {
    // Safari on Apple Silicon falsely reports Intel → assume ARM unless clearly x86
    if (isArm()) return 'arm64';
    if (isAmd()) return 'x64';
    return 'arm64';
  }

  function archResult() {
    return isArm() ? 'arm64' : 'x64';
  }

  if (/iphone|ipad|ipod|ios/.test(ua)) return { os: 'ios', arch: 'arm64' };

  if (/mac os|macintosh/.test(ua)) return { os: 'macos', arch: archResultMac() };

  if (/windows nt/.test(ua)) return { os: 'windows', arch: archResult() };

  if (/linux|debian/.test(ua)) return { os: 'debian', arch: archResult() };

  return null;
};

const getDistributableUrl = ({ fileName }: { fileName: string }): string =>
  `${DESKTOP_S3_URL}/${fileName}`;

export type Distributable = {
  arch: Arch;
  fileExtension: string;
  label: string;
  os: Os;
  url: string;
};

export const distributables: Distributable[] = [
  {
    arch: 'x64',
    fileExtension: 'deb',
    label: 'Debian (x64)',
    os: 'debian',
    url: getDistributableUrl({ fileName: `smartquery-desktop_${DESKTOP_VERSION}_amd64.deb` }),
  },
  {
    arch: 'arm64',
    fileExtension: 'deb',
    label: 'Debian (arm64)',
    os: 'debian',
    url: getDistributableUrl({ fileName: `smartquery-desktop_${DESKTOP_VERSION}_arm64.deb` }),
  },
  {
    arch: 'universal',
    fileExtension: 'dmg',
    label: 'macOS (Universal)',
    os: 'macos',
    url: getDistributableUrl({ fileName: `smartquery-desktop_${DESKTOP_VERSION}_universal.dmg` }),
  },
  {
    arch: 'x64',
    fileExtension: 'exe',
    label: 'Windows (x64)',
    os: 'windows',
    url: getDistributableUrl({ fileName: `smartquery-desktop_${DESKTOP_VERSION}_x64_setup.exe` }),
  },
  {
    arch: 'arm64',
    fileExtension: '',
    label: 'iOS',
    os: 'ios',
    url: '',
  },
];
