import type { RequestHandler } from 'express';
import {
  SignedDataVerifier,
  NotificationTypeV2,
  type ResponseBodyV2DecodedPayload,
  Environment,
} from '@apple/app-store-server-library';
import { readFileSync } from 'fs';
import { revokeAppleSubscription } from './revokeAppleSubscription';
import { grantAppleSubscription } from './grantAppleSubscription';
import { prisma } from '~/prisma/client';
import path from 'path';

const getVerifier = () => {
  const bundleId = process.env.APPLE_IOS_BUNDLE_ID;
  const appId = process.env.APPLE_IOS_APP_ID;
  const appIdNumber = appId ? parseInt(appId, 10) : NaN;

  if (!bundleId) {
    throw new Error('APPLE_IOS_BUNDLE_ID environment variable is not set');
  }
  if (!appId || isNaN(appIdNumber)) {
    throw new Error(`APPLE_IOS_APP_ID environment variable is not set or invalid: ${appId}`);
  }

  const cert = readFileSync(path.join(__dirname, 'AppleRootCA-G3.cer'));
  const appleRootCertificates = [cert];
  const enableOnlineChecks = true;
  const environment = Environment.SANDBOX;
  // const environment = Environment.PRODUCTION;

  return new SignedDataVerifier(
    appleRootCertificates,
    enableOnlineChecks,
    environment,
    bundleId,
    appIdNumber,
  );
};

export const appleAppStoreWebhook: RequestHandler = async (request, response) => {
  const signedPayload = request.body?.signedPayload;

  if (!signedPayload || typeof signedPayload !== 'string') {
    response.status(422).json({ error: 'signedPayload is required' });
    return;
  }

  let decodedPayload: ResponseBodyV2DecodedPayload;

  try {
    const verifier = getVerifier();
    decodedPayload = await verifier.verifyAndDecodeNotification(signedPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorDetails =
      error instanceof Error
        ? { message: error.message, name: error.name, stack: error.stack }
        : error;

    console.log(`⚠️ Apple App Store notification verification failed:`, message || 'Unknown error');
    console.log('Error details:', JSON.stringify(errorDetails, null, 2));

    // Log environment configuration (without sensitive values)
    console.log('Verifier configuration:', {
      environment: Environment.SANDBOX,
      bundleId: process.env.APPLE_IOS_BUNDLE_ID ? '✓' : '✗',
      appId: process.env.APPLE_IOS_APP_ID ? '✓' : '✗',
      signedPayloadLength: signedPayload?.length || 0,
      certificate: readFileSync(path.join(__dirname, 'AppleRootCA-G3.cer'), 'utf-8').length,
    });

    if (error && typeof error === 'object' && 'statusCode' in error) {
      console.log('Status code:', (error as { statusCode?: number }).statusCode);
    }

    response.sendStatus(400);
    return;
  }

  const notificationType = decodedPayload.notificationType;
  console.log('Apple App Store notification', notificationType);

  const signedTransactionInfo = decodedPayload.data?.signedTransactionInfo;

  if (!signedTransactionInfo) {
    console.warn('No signedTransactionInfo in notification');
    response.status(200).json({ received: true });
    return;
  }

  let transactionInfo;
  try {
    const verifier = getVerifier();
    transactionInfo = await verifier.verifyAndDecodeTransaction(signedTransactionInfo);
  } catch (error) {
    console.log(`⚠️ Failed to verify transaction info.`, error);
    response.sendStatus(400);
    return;
  }

  switch (notificationType) {
    case NotificationTypeV2.SUBSCRIBED:
    case NotificationTypeV2.DID_RENEW:
      await grantAppleSubscription({
        prisma,
        transactionInfo,
      });
      break;

    case NotificationTypeV2.EXPIRED:
    case NotificationTypeV2.REFUND:
    case NotificationTypeV2.REVOKE:
      await revokeAppleSubscription({
        prisma,
        transactionInfo,
      });
      break;

    default:
      console.log(`Unhandled notification type: ${notificationType}`);
      break;
  }

  response.status(200).json({ received: true });
};
