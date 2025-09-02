import classNames from 'classnames';
import { useCallback } from 'react';

export type ResizeHandleProps = {
  position: 'left' | 'right';
  onResize: (size: number) => void;
};

export const ResizeHandle = (props: ResizeHandleProps) => {
  const { position, onResize } = props;

  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const onMouseMove = (event: MouseEvent) => {
        onResize(event.clientX);
      };

      document.addEventListener('mousemove', onMouseMove);

      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove);
      });
    },
    [onResize],
  );

  return (
    <div
      className={classNames(
        'absolute top-0 z-10 h-full w-[18px] cursor-col-resize bg-clip-content px-2 py-3 transition-all ease-linear hover:bg-primary',
        {
          '-left-1.5': position === 'left',
          '-right-1.5': position === 'right',
        },
      )}
      onMouseDown={onMouseDown}
    />
  );
};
