const artifactName = '${name}_${version}_${arch}.${ext}';
const artifactNameWindows = '${name}_${version}_${arch}_setup.${ext}';

module.exports = {
  appId: 'dev.dabase.link',
  asarUnpack: ['resources/**'],
  extraResources: [
    {
      from: 'prisma/client/postgres',
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
    title: 'dabase-link', // Mac ARM build fails if this contains spaces
  },
  linux: {
    target: [{ target: 'deb', arch: ['x64', 'arm64'] }],
    maintainer: 'electronjs.org',
    category: 'Utility',
  },
  deb: { artifactName },
  npmRebuild: false,
  publish: {
    acl: null,
    bucket: 'dabase-link',
    provider: 's3',
    region: 'eu-central-1',
  },
};
