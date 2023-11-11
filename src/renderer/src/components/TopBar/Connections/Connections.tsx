import { AddCircleOutline, EditOutlined } from '@mui/icons-material';
import { Button } from '@renderer/components/shared/Button/Button';
import { ListItem } from '@renderer/components/shared/ListItem/ListItem';
import { OverlayCard } from '@renderer/components/shared/OverlayCard/OverlayCard';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useState } from 'react';
import { ConnectionForm } from './ConnectionForm/ConnectionForm';
import { Header } from '../../shared/Header/Header';

export type ConnectionsProps = {
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { triggerRef } = props;

  const { connections, selectedConnectionIndex, setSelectedConnectionIndex } =
    useDefinedContext(GlobalContext);

  const [isAddingOrEditing, setIsAddingOrEditing] = React.useState(false);

  const [connectionToEditIndex, setConnectionToEditIndex] = useState<number | null>(null);

  return (
    <OverlayCard
      align="center"
      className="w-full max-w-xs p-3 shadow-xl"
      onOpen={() => setIsAddingOrEditing(false)}
      triggerRef={triggerRef}
      width={192}
    >
      {(close) => (
        <>
          {isAddingOrEditing ? (
            <ConnectionForm
              connectionToEditIndex={connectionToEditIndex}
              exit={() => {
                setConnectionToEditIndex(null);
                setIsAddingOrEditing(false);
              }}
            />
          ) : (
            <>
              <Header
                title="Connections"
                right={
                  <Button icon={<AddCircleOutline />} onClick={() => setIsAddingOrEditing(true)} />
                }
              />
              {connections.map((connection, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <ListItem
                    label={connection.name}
                    hint={[connection.host, connection.port].join(':')}
                    onClick={() => {
                      setSelectedConnectionIndex(index);
                      close();
                    }}
                    selected={selectedConnectionIndex === index}
                  />
                  <Button
                    className="sticky bottom-0 w-max"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setConnectionToEditIndex(index);
                      setIsAddingOrEditing(true);
                    }}
                  />
                </div>
              ))}
            </>
          )}
        </>
      )}
    </OverlayCard>
  );
};
