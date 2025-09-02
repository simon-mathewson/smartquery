import { useCallback } from 'react';

export type ResizeHandleProps = {
  position: 'left' | 'right';
  offset?: number;
  minWidth: number;
  maxWidth: number;
  onResize: (width: number) => void;
};

export const ResizeHandle = (props: ResizeHandleProps) => {
  const { position, offset = 0, minWidth, maxWidth, onResize } = props;

  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const container = event.currentTarget.closest('.relative, .sticky') as HTMLElement;

      const onMouseMove = (event: MouseEvent) => {
        const containerWidth = parseInt(getComputedStyle(container).width.replace('px', ''));

        const newWidth = Math.min(
          Math.max(containerWidth + event.movementX * (position === 'left' ? -1 : 1), minWidth),
          maxWidth,
        );

        onResize(newWidth);
      };

      document.addEventListener('mousemove', onMouseMove);

      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove);
      });
    },
    [maxWidth, minWidth, position, onResize],
  );

  return (
    <div
      className="absolute top-0 z-10 h-full w-[18px] cursor-col-resize bg-clip-content px-2 transition-all ease-linear hover:bg-primary"
      onMouseDown={onMouseDown}
      style={{
        [position]: `-${offset}px`,
      }}
    />
  );
};
