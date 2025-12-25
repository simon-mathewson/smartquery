import type { NativeBridgeMessage } from '@/native/types';
import { assert } from 'ts-essentials';

const updateTheme = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('dark', isDark);
};

updateTheme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

const iframe = document.getElementById('iframe') as HTMLIFrameElement | null;
const iframeWindow = iframe?.contentWindow;
assert(iframeWindow, 'iframe window not found');

// Set up bridge for the iframe
// When iframe loads, send a message to let it know it's in Electron
const setupBridge = () => {
  iframe.addEventListener('load', () => {
    void new Promise((resolve) => setTimeout(resolve)).then(
      () => void iframeWindow.postMessage(JSON.stringify({ type: 'electron-ready' }), '*'),
    );
  });
};

window.addEventListener('message', async (event) => {
  if (event.source !== iframeWindow) {
    return;
  }

  let parsed: NativeBridgeMessage | undefined;
  try {
    parsed = JSON.parse(event.data) as NativeBridgeMessage;
  } catch {
    return;
  }

  if (parsed.type === 'request') {
    const { id, method, args } = parsed;

    try {
      const responseData = await window.electronAPI.handleRequest(method, args);

      iframeWindow.postMessage(
        JSON.stringify({
          type: 'response',
          requestId: id,
          data: responseData,
        }),
        '*',
      );
    } catch (error) {
      iframeWindow.postMessage(
        JSON.stringify({
          type: 'response',
          requestId: id,
          error: error instanceof Error ? error.message : String(error),
        }),
        '*',
      );
    }
    return;
  }

  console.log(`Unknown iframe message: ${JSON.stringify(parsed)}`);
});

setupBridge();
