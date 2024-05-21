module.exports = {
  appId: 'dev.dabase.link',
  productName: 'Dabase Link',
  directories: { buildResources: 'build' },
  asarUnpack: ['resources/**'],
  files: [
    '!**/.vscode/*',
    '!src/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!{.eslintignore,.eslintrc.cjs,.prettierignore,prettier.config.js,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json}',
  ],
  win: { target: [{ target: 'nsis', arch: ['x64'] }] },
  nsis: {
    artifactName: '${name}-${version}-${arch}-setup.${ext}',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    createDesktopShortcut: 'always',
  },
  mac: {
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
  dmg: { artifactName: '${name}-${version}-${arch}.${ext}' },
  linux: {
    target: [
      { target: 'deb', arch: ['x64', 'arm64'] },
      { target: 'rpm', arch: ['x64'] },
      { target: 'snap', arch: ['x64'] },
    ],
    maintainer: 'electronjs.org',
    category: 'Utility',
  },
  appImage: { artifactName: '${name}-${version}-${arch}.${ext}' },
  npmRebuild: false,
  publish: { provider: 'generic', url: 'https://example.com/auto-updates' },
};
