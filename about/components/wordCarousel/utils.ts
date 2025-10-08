export const getPreviousIndex = (currentIndex: number, wordsLength: number) =>
  currentIndex === 0 ? wordsLength - 1 : currentIndex - 1;

export const getNextIndex = (currentIndex: number, wordsLength: number) =>
  (currentIndex + 1) % wordsLength;
