import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { DropMarker as DropMarkerType } from '@renderer/types';

export type DropMarkerProps = { column: number; horizontal?: boolean; row: number };

export const DropMarker: React.FC<DropMarkerProps> = (props) => {
  const { column, horizontal = false, row } = props;

  const { dropMarkers, setDropMarkers } = useDefinedContext(GlobalContext);

  const isThisMarker = (marker: DropMarkerType) =>
    marker.row === row && marker.column === column && marker.horizontal === horizontal;

  const marker = dropMarkers.find(isThisMarker);
  const active = marker?.active;

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDropMarkers((current) => [...current, { column, horizontal, ref, row }]);

    () => setDropMarkers((current) => current.filter((marker) => !isThisMarker(marker)));
  }, []);

  return (
    <div
      className={classNames({
        'h-[1.5px] w-full': horizontal,
        'h-full w-[1.5px]': !horizontal,
        'bg-blue-500': active,
      })}
      ref={ref}
    />
  );
};
