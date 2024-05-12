export const getIsCredentialsApiAvailable = () => 'credentials' in navigator;

export const replaceLineBreaksWithPlaceholders = (text: string) => text.replace(/\r?\n/g, '<br />');

export const replacePlaceholdersWithLineBreaks = (text: string) => text.replace(/<br \/>/g, '\n');
