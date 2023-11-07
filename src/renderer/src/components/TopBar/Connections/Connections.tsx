import { Add } from '@mui/icons-material';
import { Button } from '@renderer/components/shared/Button/Button';
import { ListItem } from '@renderer/components/shared/ListItem/ListItem';
import { OverlayCard } from '@renderer/components/shared/OverlayCard/OverlayCard';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React from 'react';

export type ConnectionsProps = {
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { triggerRef } = props;

  const { connections, selectedConnectionIndex, setSelectedConnectionIndex } =
    useDefinedContext(GlobalContext);

  return (
    <OverlayCard
      align="center"
      className="w-full max-w-xs p-2 shadow-xl"
      triggerRef={triggerRef}
      width={192}
    >
      {(close) => (
        <>
          {connections.map((connection, index) =>
            selectedConnectionIndex === index ? null : (
              <ListItem
                key={index}
                label={connection.name}
                hint={[connection.host, connection.port].join(':')}
                onClick={() => {
                  setSelectedConnectionIndex(index);
                  close();
                }}
              />
            ),
          )}
          <Button className="sticky bottom-0" icon={<Add />} label="Add Connection" />
        </>
      )}
    </OverlayCard>
  );
};
