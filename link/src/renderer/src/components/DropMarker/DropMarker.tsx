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
      className={classNames('z-10 shrink-0', {
        '-mt-[2px] h-[2px] w-full first:-mb-[2px] first:mt-0': horizontal,
        '-ml-[2px] h-full w-[2px] first:-mr-[2px] first:ml-0': !horizontal,
        'bg-blue-500': active,
      })}
      ref={ref}
    />
  );
};
