import { ArrowBack, Close, DeleteOutline, Done } from '@mui/icons-material';
import { Button } from '~/shared/components/Button/Button';
import { Input } from '~/shared/components/Input/Input';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import React, { useRef, useState } from 'react';
import { Header } from '../../../../shared/components/Header/Header';
import { TestConnection } from './TestConnection/TestConnection';
import { FormSchema, connectionSchema, isFormValid } from './utils';
import { Select } from '~/shared/components/Select/Select';
import { ConnectionsContext } from '~/content/connections/Context';
import { uniqueId } from 'lodash';

export type ConnectionFormProps = {
  connectionToEditIndex: number | null;
  exit: () => void;
};

export const ConnectionForm: React.FC<ConnectionFormProps> = (props) => {
  const { connectionToEditIndex, exit } = props;

  const mode = connectionToEditIndex === null ? 'add' : 'edit';

  const { addConnection, connections, removeConnection, updateConnection } =
    useDefinedContext(ConnectionsContext);
  const connectionToEdit =
    connectionToEditIndex !== null ? connections[connectionToEditIndex] : null;

  const [form, setForm] = useState<FormSchema>(
    connectionToEdit ?? {
      database: '',
      engine: null,
      host: '',
      id: uniqueId(),
      name: '',
      password: '',
      port: null,
      user: '',
    },
  );

  const getChangeHandler =
    (key: keyof FormSchema, convert?: (value: string) => unknown) => (value: string) => {
      setForm((formValues) => ({ ...formValues, [key]: convert ? convert(value) : value }));
    };

  const deleteButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <form
        className="mx-auto grid w-full max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault();

          const connection = connectionSchema.parse(form);

          connectionToEdit
            ? updateConnection(connectionToEdit.id, connection)
            : addConnection(connection);

          exit();
        }}
      >
        <Header
          left={<Button icon={<ArrowBack />} onClick={exit} />}
          right={
            connectionToEdit !== null && (
              <>
                <Button icon={<DeleteOutline />} ref={deleteButtonRef} variant="danger" />
                <OverlayCard align="right" className="p-2" triggerRef={deleteButtonRef}>
                  {({ close }) => (
                    <div className="grid gap-2">
                      <div className="p-2 text-center text-sm font-medium text-gray-600">
                        Delete this connection?
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button icon={<Close />} label="No" onClick={close} />
                        <Button
                          icon={<Done />}
                          label="Yes"
                          onClick={() => {
                            removeConnection(connectionToEdit.id);
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
        <Select
          label="Engine"
          onChange={getChangeHandler('engine')}
          options={[
            {
              label: 'MySQL',
              value: 'mysql',
            },
            {
              label: 'PostgreSQL',
              value: 'postgresql',
            },
            {
              label: 'SQL Server',
              value: 'sqlserver',
            },
          ]}
          value={form.engine}
        />
        <Input label="Name" onChange={getChangeHandler('name')} value={form.name} />
        <div className="grid grid-cols-2 gap-2">
          <Input label="Host" onChange={getChangeHandler('host')} value={form.host} />
          <Input
            label="Port"
            onChange={getChangeHandler('port', (value) => (value ? Number(value) : null))}
            value={form.port === null ? '' : String(form.port)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input label="User" onChange={getChangeHandler('user')} value={form.user} />
          <Input
            label="Password"
            onChange={getChangeHandler('password')}
            type="password"
            value={form.password}
          />
        </div>
        <Input
          label="Default Database"
          onChange={getChangeHandler('database')}
          value={form.database}
        />
        <TestConnection form={form} />
        <Button
          disabled={!isFormValid(form)}
          icon={<Done />}
          label={mode === 'add' ? 'Add' : 'Save'}
          type="submit"
          variant="primary"
        />
      </form>
    </>
  );
};
