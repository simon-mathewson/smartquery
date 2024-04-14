import React, { useState } from 'react';
import { ConnectionList } from '~/content/connections/list/List';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';

export type ConnectionsProps = {
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { triggerRef } = props;

  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);

  return (
    <OverlayCard
      align="left"
      className="w-max p-2 shadow-2xl"
      onOpen={() => setIsAddingOrEditing(false)}
      triggerRef={triggerRef}
    >
      {() => (
        <ConnectionList
          isAddingOrEditing={isAddingOrEditing}
          setIsAddingOrEditing={setIsAddingOrEditing}
        />
      )}
    </OverlayCard>
  );
};
