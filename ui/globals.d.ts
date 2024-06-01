declare module 'tailwindcss-easing' {
  import type { PluginCreator } from 'tailwindcss';
  const easing: PluginCreator;
  export default easing;
}

interface Window {
  showOpenFilePicker: () => Promise<[FileSystemFileHandle]>;
}

interface FileSystemFileHandle {
  requestPermission: (options?: { mode: 'read' | 'readwrite' }) => Promise<void>;
}

declare class PasswordCredential extends Credential {
  public id: string;
  public password: string;

  constructor(options: { id: string; password: string });
}

interface CredentialRequestOptions {
  password: boolean;
}

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}
