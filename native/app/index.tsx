import { useOrientation } from "@/hooks/useOrientation";
import ConnectorModule from "@/modules/connector/src/ConnectorModule";
import assert from "assert";
import Constants from "expo-constants";
import { File } from "expo-file-system";
import { Orientation } from "expo-screen-orientation";
import { castArray } from "lodash";
import { useCallback, useRef } from "react";
import { useColorScheme } from "react-native";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";
import type {
  GetSqliteFile,
  NativeWebviewMessage,
  WriteSqliteFile,
} from "../../shared/native/types";

export default function Index() {
  const colorScheme = useColorScheme();
  const orientation = useOrientation();

  const webviewRef = useRef<WebView>(null);

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

  const writeSqliteFile = useCallback<WriteSqliteFile>(
    async (connectionId, base64) => {
      const file = await getOrPickSqliteFile(connectionId);
      file.write(base64, { encoding: "base64" });
    },
    [getOrPickSqliteFile]
  );

  const onMessage = async (payload: WebViewMessageEvent) => {
    let parsed;
    try {
      parsed = JSON.parse(payload.nativeEvent.data) as NativeWebviewMessage;
      // eslint-disable-next-line no-empty
    } catch {}

    if (!parsed) return;

    if (parsed.type === "console") {
      const { level, message } = parsed;

      console[level](`[webview] ${message}`);
      return;
    }

    if (parsed.type === "request") {
      assert(webviewRef.current, "WebView is not mounted");

      const { id, method, args } = parsed;

      try {
        const responseData = await (async () => {
          switch (method) {
            case "connectDb":
              return ConnectorModule.connectDb(...args);
            case "disconnectDb":
              return ConnectorModule.disconnectDb(...args);
            case "runQuery":
              return ConnectorModule.runQuery(...args);
            case "getSqliteFile":
              return getSqliteFile(...args);
            case "writeSqliteFile":
              return writeSqliteFile(...args);
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
  
    const consoleLog = (type, message) => ReactNativeWebView.postMessage(JSON.stringify({type: 'console', level: type, message}));

    console = {
      log: (message) => consoleLog('log', message),
      debug: (message) => consoleLog('debug', message),
      info: (message) => consoleLog('info', message),
      warn: (message) => consoleLog('warn', message),
      error: (message) => consoleLog('error', message),
    };

    void(0);
  `;

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: "http://localhost:5173" }}
      style={{
        flex: 1,
        paddingLeft:
          orientation === Orientation.LANDSCAPE_RIGHT
            ? Constants.statusBarHeight
            : 0,
        paddingRight:
          orientation === Orientation.LANDSCAPE_LEFT
            ? Constants.statusBarHeight
            : 0,
        paddingTop:
          orientation === Orientation.PORTRAIT_UP
            ? Constants.statusBarHeight
            : 0,
        backgroundColor: colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
      }}
      // Required for the injectedJavaScript to work
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
    />
  );
}
