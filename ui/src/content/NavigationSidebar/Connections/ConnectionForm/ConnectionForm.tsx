import { ArrowBack, DeleteOutline, Done } from '@mui/icons-material';
import { uniqueId } from 'lodash';
import React, { useState } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { Button } from '~/shared/components/Button/Button';
import { ConfirmDeletePopover } from '~/shared/components/ConfirmDeletePopover/ConfirmDeletePopover';
import { Input } from '~/shared/components/Input/Input';
import { Select } from '~/shared/components/Select/Select';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Header } from '../../../../shared/components/Header/Header';
import { TestConnection } from './TestConnection/TestConnection';
import { FormSchema, connectionSchema, isFormValid } from './utils';
import { Field } from '~/shared/components/Field/Field';

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
              <ConfirmDeletePopover
                onConfirm={() => {
                  removeConnection(connectionToEdit.id);
                  exit();
                }}
                renderTrigger={({ ref }) => (
                  <Button icon={<DeleteOutline />} ref={ref} variant="danger" />
                )}
                text="Delete connection"
              />
            )
          }
          title={`${mode === 'add' ? 'Add' : 'Edit'} Connection`}
        />
        <Field label="Engine">
          <Select
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
        </Field>
        <Field label="Name">
          <Input onChange={getChangeHandler('name')} value={form.name} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Host">
            <Input onChange={getChangeHandler('host')} value={form.host} />
          </Field>
          <Field label="Port">
            <Input
              onChange={getChangeHandler('port', (value) => (value ? Number(value) : null))}
              value={form.port === null ? '' : String(form.port)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="User">
            <Input onChange={getChangeHandler('user')} value={form.user} />
          </Field>
          <Field label="Password">
            <Input onChange={getChangeHandler('password')} type="password" value={form.password} />
          </Field>
        </div>
        <Field label="Default Database">
          <Input onChange={getChangeHandler('database')} value={form.database} />
        </Field>
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
