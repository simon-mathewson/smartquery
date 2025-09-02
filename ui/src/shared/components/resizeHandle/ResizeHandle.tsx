import { useCallback } from 'react';

export type ResizeHandleProps = {
  position: 'left' | 'right';
  offset?: number;
  setWidth: React.Dispatch<React.SetStateAction<number>>;
  minWidth: number;
  maxWidth: number;
};

export const ResizeHandle = (props: ResizeHandleProps) => {
  const { position, offset = 0, setWidth, minWidth, maxWidth } = props;

  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const onMouseMove = (event: MouseEvent) => {
        setWidth((width) =>
          Math.min(
            Math.max(width + event.movementX * (position === 'left' ? -1 : 1), minWidth),
            maxWidth,
          ),
        );
      };

      document.addEventListener('mousemove', onMouseMove);

      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove);
      });
    },
    [maxWidth, minWidth, position, setWidth],
  );

  return (
    <div
      className="absolute top-0 z-10 h-full w-[18px] cursor-col-resize bg-clip-content px-2 py-3 transition-all ease-linear hover:bg-primary"
      onMouseDown={onMouseDown}
      style={{
        [position]: `-${offset}px`,
      }}
    />
  );
};
