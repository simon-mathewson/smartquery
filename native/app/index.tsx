import { useOrientation } from "~/hooks/useOrientation";
import ConnectorModule from "~/modules/connector/src/ConnectorModule";
import assert from "assert";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { File, Paths } from "expo-file-system";
import { useNetworkState } from "expo-network";
import * as SplashScreen from "expo-splash-screen";
import { Orientation } from "expo-screen-orientation";
import { castArray } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useColorScheme, Dimensions, Linking, Share } from "react-native";
import * as Keychain from "react-native-keychain";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";
import type {
  AddToKeychain,
  GetFromKeychain,
  GetSqliteFile,
  GetSubscriptionPrice,
  GetUserCredential,
  NativeBridgeMessage,
  RemoveFromKeychain,
  PurchaseSubscription,
  FinishPurchase,
  ShareFile,
} from "../../shared/native/types";
import {
  Credential,
  getKeychainServiceName,
  parseCredentialUsername,
} from "~/utils/credentials";
import { buildCredentialUsername } from "~/utils/credentials";
import { Purchase, useIAP } from "expo-iap";
import { getSubscriptionTypeForAppleProductId } from "~/utils/getSubscriptionTypeForAppleProductId";

const keychainServiceNameBase = process.env.EXPO_PUBLIC_KEYCHAIN_SERVICE_NAME;

export default function Index() {
  const colorScheme = useColorScheme();
  const orientation = useOrientation();
  const networkState = useNetworkState();

  const webviewRef = useRef<WebView>(null);

  const [windowDimensions, setWindowDimensions] = useState(() =>
    Dimensions.get("window")
  );

  // Prevent splash screen from auto-hiding
  useEffect(() => {
    SplashScreen.setOptions({
      duration: 200,
      fade: true,
    });
    void SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const addToKeychain = useCallback<AddToKeychain>(
    async (username, password, type) => {
      const fullUsername = buildCredentialUsername({ username, type });

      await Keychain.setGenericPassword(fullUsername, password, {
        service: getKeychainServiceName(keychainServiceNameBase, fullUsername),
      });
    },
    []
  );

  const getFromKeychain = useCallback<GetFromKeychain>(
    async (username, type) => {
      const fullUsername = buildCredentialUsername({ username, type });

      const credentials = await Keychain.getGenericPassword({
        service: getKeychainServiceName(keychainServiceNameBase, fullUsername),
      });
      if (credentials) {
        return credentials.password;
      }
      return null;
    },
    []
  );

  const removeFromKeychain = useCallback<RemoveFromKeychain>(
    async (username, type) => {
      const fullUsername = buildCredentialUsername({ username, type });
      await Keychain.resetGenericPassword({
        service: getKeychainServiceName(keychainServiceNameBase, fullUsername),
      });
    },
    []
  );

  const getUserCredential = useCallback<GetUserCredential>(async (username) => {
    const items: Array<Credential> = [];

    const genericPasswordServices =
      await Keychain.getAllGenericPasswordServices({
        skipUIAuth: true,
      });

    for (const service of genericPasswordServices) {
      const credentials = await Keychain.getGenericPassword({ service });
      if (credentials) {
        items.push(credentials);
      }
    }

    return (
      items.find((item) => {
        const { rawUsername, type } = parseCredentialUsername(item.username);
        return type === "user" && (username ? rawUsername === username : true);
      }) ?? null
    );
  }, []);

  const sqliteFiles = useRef<{ [connectionId: string]: File }>({});

  const getOrPickSqliteFile = useCallback(async (connectionId: string) => {
    if (connectionId in sqliteFiles.current) {
      return sqliteFiles.current[connectionId];
    }

    const files = (await File.pickFileAsync()) as unknown as File | File[];

    const file: File | undefined = castArray(files).at(0);
    if (!file) {
      throw new Error(`No file selected`);
    }

    sqliteFiles.current[connectionId] = file;

    return file;
  }, []);

  const getSqliteFile = useCallback<GetSqliteFile>(
    async (connectionId) => {
      const file = await getOrPickSqliteFile(connectionId);

      return { name: file.name, base64: await file.base64() };
    },
    [getOrPickSqliteFile]
  );

  const resolvePurchaseSubscription = useRef<(() => void) | null>(null);
  const rejectPurchaseSubscription = useRef<((error: Error) => void) | null>(
    null
  );
  const purchaseToFinish = useRef<Purchase | null>(null);

  const iap = useIAP({
    onPurchaseSuccess: (purchase) => {
      resolvePurchaseSubscription.current?.();
      purchaseToFinish.current = purchase;
    },
    onPurchaseError: (error) => {
      rejectPurchaseSubscription.current?.(error);
    },
  });

  useEffect(() => {
    if (iap.connected) {
      void iap.fetchProducts({
        skus: [process.env.EXPO_PUBLIC_APPLE_IOS_PLUS_PRODUCT_ID],
        type: "subs",
      });
    }
  }, [iap.connected]);

  const getSubscriptionPrice = useCallback<GetSubscriptionPrice>(
    (type) => {
      assert(iap.connected, "Not connected to App Store");

      const subscription = iap.subscriptions.find(
        (subscription) =>
          getSubscriptionTypeForAppleProductId(subscription.id) === type
      );
      assert(subscription, `Subscription not found for type: ${type}`);
      return Promise.resolve(subscription.displayPrice);
    },
    [iap]
  );

  const purchaseSubscription = useCallback<PurchaseSubscription>(
    async (type, userId) => {
      assert(iap.connected, "Not connected to App Store");

      const subscription = iap.subscriptions.find(
        (subscription) =>
          getSubscriptionTypeForAppleProductId(subscription.id) === type
      );
      assert(subscription, `Subscription not found for type: ${type}`);

      const promise = new Promise<void>((resolve, reject) => {
        resolvePurchaseSubscription.current = resolve;
        rejectPurchaseSubscription.current = reject;
      });

      await iap.requestPurchase({
        request: {
          apple: {
            sku: subscription.id,
            appAccountToken: userId,
          },
        },
        type: "subs",
      });

      return promise;
    },
    [iap]
  );

  const finishPurchase = useCallback<FinishPurchase>(async () => {
    assert(purchaseToFinish.current, "No purchase to finish");
    await iap.finishTransaction({
      purchase: purchaseToFinish.current,
      isConsumable: false,
    });
    purchaseToFinish.current = null;
  }, [iap, purchaseToFinish]);

  const shareFile = useCallback<ShareFile>(async (content, filename) => {
    const file = new File(Paths.cache, filename);

    try {
      file.delete();
    } catch {}

    file.create();
    file.write(content);

    await Share.share({
      url: file.uri,
      title: filename,
    });
  }, []);

  const onMessage = async (payload: WebViewMessageEvent) => {
    let parsed;
    try {
      parsed = JSON.parse(payload.nativeEvent.data) as NativeBridgeMessage;
      // eslint-disable-next-line no-empty
    } catch {}

    if (!parsed) return;

    if (parsed.type === "console") {
      const { level, messages } = parsed;

      console[level](`[webview]`, ...(messages ?? []));
      return;
    }

    if (parsed.type === "request") {
      assert(webviewRef.current, "WebView is not mounted");

      const { id, method, args } = parsed;

      try {
        const responseData = await (async () => {
          switch (method) {
            case "addToKeychain":
              return addToKeychain(...args);
            case "getFromKeychain":
              return getFromKeychain(...args);
            case "removeFromKeychain":
              return removeFromKeychain(...args);
            case "getSubscriptionPrice":
              return getSubscriptionPrice(...args);
            case "purchaseSubscription":
              return purchaseSubscription(...args);
            case "finishPurchase":
              return finishPurchase(...args);
            case "getUserCredential":
              return getUserCredential(...args);
            case "connectDb":
              return ConnectorModule.connectDb(...args);
            case "switchCatalogOrSchema":
              return ConnectorModule.switchCatalogOrSchema(...args);
            case "disconnectDb":
              return ConnectorModule.disconnectDb(...args);
            case "runQuery":
              return ConnectorModule.runQuery(...args);
            case "getSqliteFile":
              return getSqliteFile(...args);
            case "shareFile":
              return shareFile(...args);
            case "writeToClipboard":
              return ConnectorModule.writeToClipboard(...args);
          }
        })();

        webviewRef.current.postMessage(
          JSON.stringify({
            type: "response",
            requestId: id,
            data: responseData,
          })
        );
      } catch (error) {
        webviewRef.current.postMessage(
          JSON.stringify({
            type: "response",
            requestId: id,
            error: error instanceof Error ? error.message : String(error),
          })
        );
      }
      return;
    }

    console.log(`Unknown WebView message: ${JSON.stringify(parsed)}`);
  };

  const injectedJavaScript = `
    window.statusBarHeight = ${Constants.statusBarHeight};
  
    const consoleLog = (type, ...messages) => ReactNativeWebView.postMessage(JSON.stringify({type: 'console', level: type, messages}));

    console = {
      log: (...messages) => consoleLog('log', ...messages),
      debug: (...messages) => consoleLog('debug', ...messages),
      info: (...messages) => consoleLog('info', ...messages),
      warn: (...messages) => consoleLog('warn', ...messages),
      error: (...messages) => consoleLog('error', ...messages),
      dir: (...messages) => consoleLog('dir', ...messages),
    };

    void(0);
  `;

  const { isIosOnMac } = ConnectorModule;

  const paddingTop =
    !isIosOnMac &&
    (orientation === Orientation.PORTRAIT_UP ||
      Device.deviceType !== Device.DeviceType.PHONE)
      ? Constants.statusBarHeight
      : 0;
  const paddingLeft =
    !isIosOnMac &&
    orientation === Orientation.LANDSCAPE_RIGHT &&
    Device.deviceType === Device.DeviceType.PHONE
      ? Constants.statusBarHeight
      : 0;
  const paddingRight =
    !isIosOnMac &&
    orientation === Orientation.LANDSCAPE_LEFT &&
    Device.deviceType === Device.DeviceType.PHONE
      ? Constants.statusBarHeight
      : 0;

  const scale = isIosOnMac ? 1.3 : 1;
  const { height: screenHeight, width: screenWidth } = windowDimensions;
  const webviewWidth = Math.ceil(screenWidth * (1 / scale));
  const webviewHeight = Math.ceil(screenHeight * (1 / scale));
  const webviewLeft = (screenWidth - webviewWidth) / 2;
  const webviewTop = (screenHeight - webviewHeight) / 2;

  const baseUrl = new URL(process.env.EXPO_PUBLIC_UI_URL);
  const baseUrlHost = baseUrl.port
    ? `${baseUrl.hostname}:${baseUrl.port}`
    : baseUrl.hostname;

  // Open external links in browser
  const onShouldStartLoadWithRequest = useCallback(
    (request: {
      url: string;
      navigationType?: string;
      isTopFrame?: boolean;
    }) => {
      // Only intercept top-level page navigations, not resource loads (JS, CSS, images, etc.)
      // Resource loads typically have:
      // - isTopFrame === false (sub-resources)
      // - navigationType === 'other' (non-user-initiated)
      if (request.isTopFrame === false || request.navigationType === "other") {
        return true;
      }

      // For actual page navigations, check if it's external
      try {
        const requestUrl = new URL(request.url);
        const requestHost = requestUrl.port
          ? `${requestUrl.hostname}:${requestUrl.port}`
          : requestUrl.hostname;
        if (requestHost === baseUrlHost) {
          return true;
        }
      } catch {
        return true;
      }

      // External page navigation - open in browser
      void Linking.openURL(request.url);
      return false;
    },
    [baseUrlHost]
  );

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: process.env.EXPO_PUBLIC_UI_URL }}
      style={{
        position: "absolute",
        top: webviewTop,
        left: webviewLeft,
        width: webviewWidth,
        height: webviewHeight,
        paddingTop,
        paddingLeft,
        paddingRight,
        backgroundColor: colorScheme === "dark" ? "#0a0a0a" : "#f4f4f4",
        transform: [{ scale }],
      }}
      // Required for the injectedJavaScript to work
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
      hideKeyboardAccessoryView={isIosOnMac}
      onLoadEnd={SplashScreen.hideAsync}
      onError={SplashScreen.hideAsync}
      cacheMode={
        networkState.isInternetReachable ? "LOAD_DEFAULT" : "LOAD_CACHE_ONLY"
      }
      limitsNavigationsToAppBoundDomains
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
    />
  );
}
