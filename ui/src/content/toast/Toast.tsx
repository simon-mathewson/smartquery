import { Close } from '@mui/icons-material';
import classNames from 'classnames';
import { Button } from '~/shared/components/button/Button';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ToastContext } from './Context';
import { useEffect, useState } from 'react';
import type { ToastProps } from './useToast';
import { useOverlay } from '~/shared/components/overlay/useOverlay';

export const Toast: React.FC = () => {
  const { queue, remove } = useDefinedContext(ToastContext);

  const [currentToast, setCurrentToast] = useState<ToastProps | null>(null);

  const overlay = useOverlay({
    isOpen: Boolean(currentToast),
    closeOnOutsideClick: false,
    onClose: () => {
      if (currentToast) {
        remove(currentToast.id);
      }
    },
    position: { x: 'center', y: 'bottom' },
    styleOptions: {
      overlayMargin: 16,
    },
  });

  useEffect(() => {
    const nextToast = queue.at(0);

    if (nextToast === currentToast) {
      return;
    }

    if (!nextToast) {
      if (currentToast) {
        void overlay.close().then(() => {
          setCurrentToast(null);
        });
      }
      return;
    }

    if (currentToast) {
      void overlay.close().then(() => {
        setTimeout(() => {
          setCurrentToast(nextToast);
          overlay.open();
        }, 0);
      });
      return;
    }

    setCurrentToast(nextToast);
  }, [currentToast, queue, overlay]);

  if (!currentToast) {
    return null;
  }

  const { color, description, htmlProps, id, title } = currentToast;

  return (
    <OverlayCard
      htmlProps={{
        className: classNames(
          'grid w-72 grid-cols-[1fr_max-content] gap-2 p-1 align-top cursor-pointer border-none',
          {
            'bg-danger': color === 'danger',
            'bg-primary': color === 'primary',
            'bg-success': color === 'success',
          },
        ),
        onClick: () => remove(id),
        ...htmlProps,
      }}
      overlay={overlay}
    >
      {() => (
        <>
          <div className="flex flex-col justify-center gap-[2px] px-1">
            <div className="text-sm font-medium text-white">{title}</div>
            {description && <div className="text-xs text-whiteHover">{description}</div>}
          </div>
          <Button
            color="white"
            htmlProps={{
              onClick: (event) => {
                event.stopPropagation();
                remove(id);
              },
            }}
            icon={<Close />}
          />
        </>
      )}
    </OverlayCard>
  );
};
