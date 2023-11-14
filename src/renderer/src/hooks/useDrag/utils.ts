import { DropMarker } from '@renderer/types';

export const getClosestDropMarker = (dropMarkers: DropMarker[], x: number, y: number) => {
  const distances = dropMarkers.map((dropMarker) => {
    const rect = dropMarker.ref.current?.getBoundingClientRect();
    if (!rect) return { distance: Infinity, dropMarker };

    const distance = dropMarker.horizontal ? Math.abs(y - rect.top) : Math.abs(x - rect.left);
    return { distance, dropMarker };
  });

  const closestDropMarker = distances.reduce((closest, current) =>
    closest.distance > current.distance ? current : closest,
  );

  return closestDropMarker.dropMarker;
};
