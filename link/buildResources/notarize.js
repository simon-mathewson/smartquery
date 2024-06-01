const { notarize: electronNotarize } = require('@electron/notarize');

exports.default = async function notarize(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  return await electronNotarize({
    appBundleId: 'dev.dabase.link',
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    appPath: `${appOutDir}/${context.packager.appInfo.productFilename}.app`,
    teamId: process.env.APPLE_TEAM_ID,
  });
};
