import { Close } from '@mui/icons-material';
import classNames from 'classnames';
import { Button } from '~/shared/components/button/Button';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ToastContext } from './Context';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useRef } from 'react';

export type ToastProps = {
  color?: 'danger' | 'primary' | 'success';
  description?: string;
  id: string;
  title: string;
};

export const Toast: React.FC<ToastProps> = (props) => {
  const { color, description, id, title } = props;

  const toast = useDefinedContext(ToastContext);

  const closeRef = useRef<(() => Promise<void>) | null>(null);

  useEffectOnce(() => {
    setTimeout(async () => {
      await closeRef.current?.();
      toast.remove(id);
    }, 5000);
  });

  return (
    <OverlayCard
      htmlProps={{
        className: classNames('grid w-72 grid-cols-[1fr_max-content] gap-2 p-1 align-top', {
          'bg-danger': color === 'danger',
          'bg-primary': color === 'primary',
          'bg-success': color === 'success',
        }),
      }}
      isOpen
      onClose={() => {
        toast.remove(id);
      }}
      position={{ x: 'center', y: 'bottom' }}
    >
      {({ close }) => {
        closeRef.current = close;

        return (
          <>
            <div className="flex flex-col gap-2 p-2">
              <div className="text-sm font-medium text-white">{title}</div>
              {description && <div className="text-xs text-whiteHover">{description}</div>}
            </div>
            <Button color="white" icon={<Close />} onClick={close} />
          </>
        );
      }}
    </OverlayCard>
  );
};
