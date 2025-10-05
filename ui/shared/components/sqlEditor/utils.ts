export const getErrorMessage = (error: Error): string => {
  if (error.message.includes('Message: ')) {
    const matches = error.message.match(/Message: `(.+)`/);
    if (matches) {
      return matches[1];
    }
  }

  return error.message;
};
