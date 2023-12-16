import { DropMarker } from '@renderer/types';

export const getClosestDropMarker = (dropMarkers: DropMarker[], x: number, y: number) => {
  const distances = dropMarkers.map((dropMarker) => {
    const rect = dropMarker.ref.current?.getBoundingClientRect();
    if (!rect) return { distance: Infinity, dropMarker };

    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);

    const distance = Math.sqrt(dx * dx + dy * dy);

    return { distance, dropMarker };
  });

  const closestDropMarker = distances.reduce((closest, current) =>
    closest.distance > current.distance ? current : closest,
  );

  return closestDropMarker.dropMarker;
};
