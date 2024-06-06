const artifactName = '${name}_${version}_${arch}.${ext}';
const artifactNameWindows = '${name}_${version}_${arch}_setup.${ext}';

module.exports = {
  afterSign: 'buildResources/notarize.js',
  appId: 'dev.dabase.link',
  asarUnpack: ['resources/**'],
  extraResources: [
    {
      from: 'prisma/client/postgresql',
      to: '.prisma/client',
      filter: ['*.node'],
    },
  ],
  directories: { buildResources: 'buildResources' },
  productName: 'Dabase Link',
  files: [
    '!**/.vscode/**',
    '!src/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!{.eslintignore,.eslintrc.cjs,.prettierignore,prettier.config.js,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json}',
  ],
  win: {
    artifactName: artifactNameWindows,
    target: [{ target: 'nsis', arch: ['x64'] }],
  },
  nsis: {
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    createDesktopShortcut: 'always',
  },
  mac: {
    artifactName,
    entitlements: 'buildResources/entitlements.mac.plist',
    entitlementsInherit: 'buildResources/entitlements.mac.plist',
    extendInfo: {
      NSCameraUsageDescription: "Application requests access to the device's camera.",
      NSMicrophoneUsageDescription: "Application requests access to the device's microphone.",
      NSDocumentsFolderUsageDescription:
        "Application requests access to the user's Documents folder.",
      NSDownloadsFolderUsageDescription:
        "Application requests access to the user's Downloads folder.",
    },
    gatekeeperAssess: false,
    hardenedRuntime: true,
  },
  dmg: {
    artifactName,
    sign: false,
  },
  linux: {
    target: [
      { target: 'deb', arch: ['x64', 'arm64'] },
      { target: 'rpm', arch: ['x64'] },
    ],
    maintainer: 'electronjs.org',
    category: 'Utility',
  },
  deb: { artifactName },
  rpm: { artifactName },
  npmRebuild: false,
  publish: { provider: 'generic', url: 'https://example.com/auto-updates' },
};
