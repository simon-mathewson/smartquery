import { ArrowBack, Close, DeleteOutline, Done, SettingsEthernet } from '@mui/icons-material';
import { Button } from '@renderer/components/shared/Button/Button';
import { Input } from '@renderer/components/shared/Input/Input';
import { OverlayCard } from '@renderer/components/shared/OverlayCard/OverlayCard';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useRef, useState } from 'react';
import { Header } from '../../../shared/Header/Header';

export type ConnectionFormProps = {
  connectionToEditIndex: number | null;
  exit: () => void;
};

export const ConnectionForm: React.FC<ConnectionFormProps> = (props) => {
  const { connectionToEditIndex, exit } = props;

  const mode = connectionToEditIndex === null ? 'add' : 'edit';

  const { connections, setConnections } = useDefinedContext(GlobalContext);
  const connectionToEdit =
    connectionToEditIndex !== null ? connections[connectionToEditIndex] : null;

  const [name, setName] = useState<string>(connectionToEdit?.name ?? '');
  const [host, setHost] = useState<string>(connectionToEdit?.host ?? '');
  const [user, setUser] = useState<string>(connectionToEdit?.user ?? '');
  const [password, setPassword] = useState<string>(connectionToEdit?.password ?? '');
  const [port, setPort] = useState<string>(connectionToEdit?.port.toString() ?? '');
  const [defaultDatabase, setDefaultDatabase] = useState<string>(
    connectionToEdit?.defaultDatabase ?? '',
  );

  const deleteButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <form
        className="mx-auto grid w-full max-w-md gap-3"
        onSubmit={(event) => {
          event.preventDefault();

          setConnections((connections) => [
            ...connections,
            {
              defaultDatabase,
              host,
              name,
              password,
              port: Number(port),
              user,
            },
          ]);
          exit();
        }}
      >
        <Header
          left={<Button icon={<ArrowBack />} onClick={exit} />}
          right={
            connectionToEditIndex !== null && (
              <>
                <Button icon={<DeleteOutline />} ref={deleteButtonRef} variant="danger" />
                <OverlayCard align="right" className="p-2" triggerRef={deleteButtonRef}>
                  {(close) => (
                    <div className="grid gap-2">
                      <div className="p-2 text-center text-sm font-medium text-gray-600">
                        Delete this connection?
                      </div>
                      <div className="flex gap-2">
                        <Button icon={<Close />} label="No" onClick={close} />
                        <Button
                          icon={<Done />}
                          label="Yes"
                          onClick={() => {
                            setConnections((connections) =>
                              connections.filter((_, index) => index !== connectionToEditIndex),
                            );
                            exit();
                          }}
                          variant="danger"
                        />
                      </div>
                    </div>
                  )}
                </OverlayCard>
              </>
            )
          }
          title={`${mode === 'add' ? 'Add' : 'Edit'} Connection`}
        />
        <Input label="Name" onChange={setName} value={name} />
        <div className="grid grid-cols-2 gap-2">
          <Input label="Host" onChange={setHost} value={host} />
          <Input label="Port" onChange={setPort} value={port} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input label="User" onChange={setUser} value={user} />
          <Input label="Password" onChange={setPassword} type="password" value={password} />
        </div>
        <Input label="Default Database" onChange={setDefaultDatabase} value={defaultDatabase} />
        <Button icon={<SettingsEthernet />} label="Test Connection" />

        <Button label={mode === 'add' ? 'Add' : 'Save'} type="submit" variant="primary" />
      </form>
    </>
  );
};
