export const detectAdBlocker = async (): Promise<boolean> => {
  const googleAdUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  try {
    await fetch(new Request(googleAdUrl));
    return false;
  } catch {
    return true;
  }
};
