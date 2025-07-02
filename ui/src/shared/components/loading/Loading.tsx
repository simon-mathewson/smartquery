import { CircularProgress } from '@mui/material';

export type LoadingProps = {
  large?: boolean;
};

export const Loading: React.FC<LoadingProps> = ({ large }) => (
  <div className="absolute inset-0 flex h-full w-full items-center justify-center">
    <CircularProgress className="!text-primary" size={large ? 48 : 32} />
  </div>
);
