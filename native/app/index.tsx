import { StyleSheet } from "react-native";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

export default function Index() {
  const onMessage = (payload: WebViewMessageEvent) => {
    let parsed;
    try {
      parsed = JSON.parse(payload.nativeEvent.data);
      // eslint-disable-next-line no-empty
    } catch {}

    if (!parsed) return;

    if (parsed.type === "Console") {
      const { type, message } = parsed.data;

      console[type as "log" | "debug" | "info" | "warn" | "error"](
        `[webview] ${message}`
      );
      return;
    }

    console.log(`WebView message: ${JSON.stringify(parsed)}`);
  };

  const injectedJavaScript = `
    window.native = true;

    const consoleLog = (type, message) => ReactNativeWebView.postMessage(JSON.stringify({type: 'Console', data: {type, message}}));

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
      source={{ uri: "http://localhost:5173" }}
      style={styles.container}
      // Required for the injectedJavaScript to work
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
