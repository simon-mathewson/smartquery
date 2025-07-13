import { CircularProgress } from '@mui/material';

export type LoadingProps = {
  size?: 'small' | 'default' | 'large';
};

export const Loading: React.FC<LoadingProps> = ({ size = 'default' }) => (
  <div className="absolute inset-0 flex h-full w-full items-center justify-center">
    <CircularProgress
      className="!text-primary"
      size={
        {
          small: 20,
          default: 32,
          large: 48,
        }[size]
      }
    />
  </div>
);
