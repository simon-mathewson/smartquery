import React from 'react';
import { ConnectionList } from '~/content/connections/list/List';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';

export type ConnectionsProps = {
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { triggerRef } = props;

  return (
    <OverlayCard align="left" className="w-max p-2 shadow-2xl" triggerRef={triggerRef}>
      {() => <ConnectionList />}
    </OverlayCard>
  );
};
