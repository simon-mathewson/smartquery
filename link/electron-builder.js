const artifactName = '${name}_${version}_${arch}.${ext}';
const artifactNameWindows = '${name}_${version}_${arch}_setup.${ext}';

module.exports = {
  appId: 'dev.dabase.link',
  productName: 'Dabase Link',
  directories: { buildResources: 'buildResources' },
  asarUnpack: ['resources/**'],
  files: [
    '!**/.vscode/*',
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
    entitlementsInherit: 'build/entitlements.mac.plist',
    extendInfo: {
      NSCameraUsageDescription: "Application requests access to the device's camera.",
      NSMicrophoneUsageDescription: "Application requests access to the device's microphone.",
      NSDocumentsFolderUsageDescription:
        "Application requests access to the user's Documents folder.",
      NSDownloadsFolderUsageDescription:
        "Application requests access to the user's Downloads folder.",
    },
  },
  dmg: { artifactName },
  linux: {
    target: [
      { target: 'deb', arch: ['x64', 'arm64'] },
      { target: 'rpm', arch: ['x64'] },
    ],
    maintainer: 'electronjs.org',
    category: 'Utility',
  },
  npmRebuild: false,
  publish: { provider: 'generic', url: 'https://example.com/auto-updates' },
};
