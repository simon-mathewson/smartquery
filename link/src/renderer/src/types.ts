export type Query = {
  id: string;
  label?: string;
  sql?: string;
  showEditor?: boolean;
};

export type DropMarker = {
  active?: boolean;
  column: number;
  horizontal: boolean;
  ref: React.MutableRefObject<HTMLDivElement | null>;
  row: number;
};
