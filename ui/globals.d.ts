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
