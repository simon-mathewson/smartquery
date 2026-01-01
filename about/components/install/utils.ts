export type Os = "debian" | "ios" | "macos" | "windows";
export type Arch = "x64" | "arm64";

export const detectOS = async (): Promise<{
  os: Os;
  arch: Arch;
} | null> => {
  const ua = navigator.userAgent.toLowerCase();

  let architecture = null;

  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const hints = await navigator.userAgentData.getHighEntropyValues([
        "architecture",
      ]);
      architecture = hints.architecture;
    } catch {}
  }

  const isArm = () =>
    (architecture && /arm/.test(architecture)) || /arm|aarch64/.test(ua);

  const isAmd = () =>
    (architecture && /86/.test(architecture)) ||
    /x86_64|amd64|x64|win64|wow64|i[3-6]86/.test(ua);

  function archResultMac() {
    // Safari on Apple Silicon falsely reports Intel → assume ARM unless clearly x86
    if (isArm()) return "arm64";
    if (isAmd()) return "x64";
    return "arm64";
  }

  function archResult() {
    return isArm() ? "arm64" : "x64";
  }

  if (/iphone|ipad|ipod|ios/.test(ua)) return { os: "ios", arch: "arm64" };

  if (/mac os|macintosh/.test(ua))
    return { os: "macos", arch: archResultMac() };

  if (/windows nt/.test(ua)) return { os: "windows", arch: archResult() };

  if (/linux|debian/.test(ua)) return { os: "debian", arch: archResult() };

  return null;
};

export const version = process.env.NEXT_PUBLIC_DESKTOP_VERSION;

export type Distributable = {
  arch: Arch;
  fileExtension: string;
  fileName: string;
  label: string;
  os: Os;
};
export const distributables: Distributable[] = [
  {
    arch: "x64",
    fileExtension: "deb",
    fileName: `smartquery-desktop_${version}_amd64.deb`,
    label: "Debian (x64)",
    os: "debian",
  },
  {
    arch: "arm64",
    fileExtension: "deb",
    fileName: `smartquery-desktop_${version}_arm64.deb`,
    label: "Debian (arm64)",
    os: "debian",
  },
  {
    arch: "x64",
    fileExtension: "dmg",
    fileName: `smartquery-desktop_${version}_x64.dmg`,
    label: "macOS (x64)",
    os: "macos",
  },
  {
    arch: "arm64",
    fileExtension: "dmg",
    fileName: `smartquery-desktop_${version}_arm64.dmg`,
    label: "macOS (arm64)",
    os: "macos",
  },
  {
    arch: "x64",
    fileExtension: "exe",
    fileName: `smartquery-desktop_${version}_x64_setup.exe`,
    label: "Windows (x64)",
    os: "windows",
  },
  {
    arch: "arm64",
    fileExtension: "",
    fileName: "",
    label: "iOS",
    os: "ios",
  },
];

export const getDistributableUrl = ({
  fileName,
}: {
  fileName: string;
}): string => `${process.env.NEXT_PUBLIC_DESKTOP_S3_URL}/${fileName}`;
