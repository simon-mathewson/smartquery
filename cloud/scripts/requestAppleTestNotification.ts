import { readFileSync } from 'fs';
import { AppStoreServerAPIClient, Environment } from '@apple/app-store-server-library';
import path from 'path';

/**
 * Script to request a test notification from Apple App Store Server API
 *
 * Required environment variables:
 * - APPLE_APP_STORE_KEY_ID: Your App Store Connect API Key ID
 * - APPLE_APP_STORE_ISSUER_ID: Your App Store Connect Issuer ID
 * - APPLE_IOS_BUNDLE_ID: Your app's bundle ID
 * - APPLE_IOS_APP_ID: Your app's App Store Connect App ID (numeric)
 *
 * Usage:
 *   pnpm test-apple-notification
 */

async function requestTestNotification() {
  const keyId = process.env.APPLE_APP_STORE_KEY_ID;
  const issuerId = process.env.APPLE_APP_STORE_ISSUER_ID;
  const bundleId = process.env.APPLE_IOS_BUNDLE_ID;
  const appId = process.env.APPLE_IOS_APP_ID;
  const signingKey = readFileSync(path.join(__dirname, 'appleAppStoreSigningKey.p8'), 'utf-8');

  if (!signingKey || !keyId || !issuerId || !bundleId || !appId) {
    console.error('Missing required environment variables:');
    console.error('  APPLE_APP_STORE_KEY_ID:', keyId ? '✓' : '✗');
    console.error('  APPLE_APP_STORE_ISSUER_ID:', issuerId ? '✓' : '✗');
    console.error('  APPLE_IOS_BUNDLE_ID:', bundleId ? '✓' : '✗');
    console.error('  APPLE_IOS_APP_ID:', appId ? '✓' : '✗');
    console.error('  Signing key file:', signingKey ? '✓' : '✗');
    process.exit(1);
  }

  const appIdNumber = parseInt(appId, 10);
  if (isNaN(appIdNumber)) {
    console.error(`APPLE_IOS_APP_ID must be a number, got: ${appId}`);
    process.exit(1);
  }

  console.log('Creating App Store Server API client...');
  console.log(`  Bundle ID: ${bundleId}`);
  console.log(`  App ID: ${appIdNumber}`);

  const client = new AppStoreServerAPIClient(
    signingKey,
    keyId,
    issuerId,
    bundleId,
    Environment.SANDBOX,
  );

  try {
    console.log('\nRequesting test notification...');
    const response = await client.requestTestNotification();

    if (!response.testNotificationToken) {
      console.error(
        'No test notification token received. Check your App Store Connect configuration.',
      );
      console.error(
        'Ensure your app has a Server Notification URL configured for the correct environment.',
      );
      process.exit(1);
    }

    console.log('✓ Test notification requested successfully!');
    console.log(`  Test Notification Token: ${response.testNotificationToken}`);

    console.log(`\nWaiting 5 seconds for notification to be sent...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('Checking test notification status...');
    const statusResponse = await client.getTestNotificationStatus(response.testNotificationToken);

    console.log('\nTest Notification Status:');
    console.log(`  Send Attempts: ${statusResponse.sendAttempts?.length || 0}`);
    console.log(`  Signed Payload: ${statusResponse.signedPayload ? 'Present' : 'Missing'}`);

    if (statusResponse.signedPayload) {
      console.log('\n✓ Notification payload received!');
      console.log('  Your webhook endpoint should have received this notification.');
      console.log(`  Payload length: ${statusResponse.signedPayload.length} characters`);
    } else {
      console.log('\n⚠ No payload received yet. This could mean:');
      console.log('  - Your webhook URL is not reachable');
      console.log('  - Your webhook endpoint returned an error');
      console.log('  - The notification is still being processed');
      console.log('\nCheck your webhook endpoint logs and try again.');
    }

    if (statusResponse.sendAttempts && statusResponse.sendAttempts.length > 0) {
      console.log('\nSend Attempts:');
      for (let index = 0; index < statusResponse.sendAttempts.length; index++) {
        const attempt = statusResponse.sendAttempts[index];
        console.log(`  Attempt ${index + 1}:`);
        console.log(`    Status: ${attempt.attemptDate ? 'Sent' : 'Pending'}`);
        if (attempt.attemptDate) {
          console.log(`    Date: ${attempt.attemptDate}`);
        }
      }
    }
  } catch (error: unknown) {
    console.error('\n✗ Error requesting test notification:');
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode === 404) {
      console.error('  404 Not Found - Your app may not have a Server Notification URL configured');
      console.error('  Go to App Store Connect → Your App → App Store Server Notifications');
      console.error('  and set the Server Notification URL for the correct environment');
    } else if (err.statusCode === 401) {
      console.error('  401 Unauthorized - Check your signing key, key ID, and issuer ID');
    } else {
      console.error('  Error:', err.message || error);
      if (err.statusCode) {
        console.error(`  Status Code: ${err.statusCode}`);
      }
    }
    process.exit(1);
  }
}

requestTestNotification().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
