import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef } from 'react';
import { DragAndDropContext } from './Context';

export type DropMarkerProps = { column: number; horizontal?: boolean; row: number };

export const DropMarker: React.FC<DropMarkerProps> = (props) => {
  const { column, horizontal = false, row } = props;

  const { activeDropMarker, addDropMarker, removeDropMarker } =
    useDefinedContext(DragAndDropContext);

  const ref = useRef<HTMLDivElement | null>(null);

  const marker = useMemo(() => ({ column, horizontal, ref, row }), [column, horizontal, row]);

  const active = marker !== undefined && marker === activeDropMarker;

  useEffect(() => {
    addDropMarker(marker);

    () => removeDropMarker(marker);
  }, [addDropMarker, marker, removeDropMarker]);

  return (
    <div
      className={classNames('z-10 shrink-0', {
        '-mt-[2px] h-[2px] w-full first:-mb-[2px] first:mt-0': horizontal,
        '-ml-[2px] h-full w-[2px] first:-mr-[2px] first:ml-0': !horizontal,
        'bg-primary': active,
      })}
      ref={ref}
    />
  );
};
