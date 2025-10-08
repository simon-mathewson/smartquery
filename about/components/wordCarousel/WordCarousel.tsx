import classNames from "classnames";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { getNextIndex, getPreviousIndex } from "./utils";

export type WordCarouselProps = {
  align?: CSSProperties["textAlign"] &
    CSSProperties["transformOrigin"] &
    CSSProperties["perspectiveOrigin"];
  words: string[];
};

export const WordCarousel: React.FC<WordCarouselProps> = (props) => {
  const { align = "center", words } = props;
  const longestWord = words.reduce((longest, word) => {
    return word.length > longest.length ? word : longest;
  }, "");

  const [currentIndex, setCurrentIndex] = useState(2);

  const repeatedWords = [
    ...words.slice(-2),
    ...Array(100)
      .fill(undefined)
      .flatMap(() => words),
    ...words.slice(0, 2),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((currentIndex + 1) % repeatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, repeatedWords.length]);

  return (
    <div
      className="flex flex-col gap-2 h-max relative perspective-normal"
      style={{
        perspectiveOrigin: align,
      }}
    >
      <div className="invisible">{longestWord}</div>
      {repeatedWords.map((word, index) => {
        const previousIndex = getPreviousIndex(
          currentIndex,
          repeatedWords.length
        );
        const beforePreviousIndex = getPreviousIndex(
          previousIndex,
          repeatedWords.length
        );
        const nextIndex = getNextIndex(currentIndex, repeatedWords.length);
        const afterNextIndex = getNextIndex(nextIndex, repeatedWords.length);

        const isBeforePrevious = index === beforePreviousIndex;
        const isPrevious = index === previousIndex;
        const isCurrent = index === currentIndex;
        const isNext = index === nextIndex;
        const isAfterNext = index === afterNextIndex;

        return (
          <div
            className={classNames(
              "absolute w-full h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
              {
                hidden:
                  !isPrevious &&
                  !isCurrent &&
                  !isNext &&
                  !isBeforePrevious &&
                  !isAfterNext,
                "-translate-y-[100%] opacity-0 scale-50 rotate-x-[70deg]":
                  isBeforePrevious,
                "-translate-y-[80%] opacity-10 scale-75 rotate-x-[15deg]":
                  isPrevious,
                "top-0 text-blue-600": isCurrent,
                "translate-y-[80%] opacity-10 scale-75 -rotate-x-[15deg]":
                  isNext,
                "translate-y-[100%] opacity-0 scale-50 -rotate-x-[70deg]":
                  isAfterNext,
              }
            )}
            key={index}
            style={{
              textAlign: align,
              transformOrigin: align,
            }}
          >
            {word}
          </div>
        );
      })}
    </div>
  );
};
