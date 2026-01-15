import { useOrientation } from "~/hooks/useOrientation";
import ConnectorModule from "~/modules/connector/src/ConnectorModule";
import assert from "assert";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { File } from "expo-file-system";
import * as SplashScreen from "expo-splash-screen";
import { Orientation } from "expo-screen-orientation";
import { castArray } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useColorScheme, Dimensions } from "react-native";
import * as Keychain from "react-native-keychain";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";
import type {
  AddToKeychain,
  GetFromKeychain,
  GetSqliteFile,
  GetUserCredential,
  NativeBridgeMessage,
  RemoveFromKeychain,
} from "../../shared/native/types";
import {
  Credential,
  getKeychainServiceName,
  parseCredentialUsername,
} from "~/utils/credentials";
import { buildCredentialUsername } from "~/utils/credentials";

export default function Index() {
  const colorScheme = useColorScheme();
  const orientation = useOrientation();

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
        service: getKeychainServiceName(fullUsername),
      });
    },
    []
  );

  const getFromKeychain = useCallback<GetFromKeychain>(
    async (username, type) => {
      const fullUsername = buildCredentialUsername({ username, type });

      const credentials = await Keychain.getGenericPassword({
        service: getKeychainServiceName(fullUsername),
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
        service: getKeychainServiceName(fullUsername),
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
            case "getUserCredential":
              return getUserCredential();
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
        backgroundColor: colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
        transform: [{ scale }],
      }}
      // Required for the injectedJavaScript to work
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
      hideKeyboardAccessoryView={isIosOnMac}
      onLoadEnd={SplashScreen.hideAsync}
      onError={SplashScreen.hideAsync}
    />
  );
}
