import { useMemo, useRef } from 'react';
import type { UseEscapeProps } from './useEscape';
import { useEscape } from './useEscape';

export type UseEscapeStoryProps = Omit<UseEscapeProps, 'clickOutside'> & {
  clickOutside?: boolean;
};

export const UseEscapeStory: React.FC<UseEscapeStoryProps> = (props) => {
  const additionalRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEscape(
    useMemo(
      () => ({
        ...props,
        clickOutside: props.clickOutside ? { additionalRefs: [additionalRef], ref } : undefined,
      }),
      [additionalRef, ref, props],
    ),
  );

  return (
    <>
      <div className="h-8 w-8 bg-danger" ref={additionalRef} />
      <div className="h-8 w-8 bg-primary" ref={ref} />
    </>
  );
};
