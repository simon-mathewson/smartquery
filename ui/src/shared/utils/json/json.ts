export const isValidJson = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
};

export const formatJson = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch (error) {
    return value;
  }
};
