import type React from 'react';

export type DropMarker = {
  column: number;
  horizontal: boolean;
  ref: React.MutableRefObject<HTMLDivElement | null>;
  row: number;
};
