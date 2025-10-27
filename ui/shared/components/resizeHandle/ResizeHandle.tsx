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

      // Find the closest element with position: relative or sticky
      let container = event.currentTarget.parentElement;
      while (container) {
        const computedStyle = getComputedStyle(container);
        if (computedStyle.position === 'relative' || computedStyle.position === 'sticky') {
          break;
        }
        container = container.parentElement;
      }
      if (!container) return;

      const containerWidth = parseInt(getComputedStyle(container).width.replace('px', ''), 10);
      let movementX = 0;

      const onMouseMove = (event: MouseEvent) => {
        movementX += event.movementX;

        const newWidth = Math.min(
          Math.max(containerWidth + movementX * (position === 'left' ? -1 : 1), minWidth),
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

  const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div
      className="absolute top-0 z-10 h-full w-[18px] cursor-col-resize bg-clip-content px-2 transition-all ease-linear hover:bg-primary"
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        [position]: `-${offset}px`,
      }}
    />
  );
};
