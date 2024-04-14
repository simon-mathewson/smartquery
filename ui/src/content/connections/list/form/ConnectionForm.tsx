import { ArrowBack, DeleteOutline, Done } from '@mui/icons-material';
import React, { useState } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { Button } from '~/shared/components/Button/Button';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { ConfirmDeletePopover } from '~/shared/components/ConfirmDeletePopover/ConfirmDeletePopover';
import { Field } from '~/shared/components/Field/Field';
import { Input } from '~/shared/components/Input/Input';
import { Select } from '~/shared/components/Select/Select';
import { ThreeColumns } from '~/shared/components/ThreeColumns/ThreeColumns';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TestConnection } from './test/TestConnection';
import type { FormSchema } from './utils';
import { isFormValid } from './utils';
import { connectionSchema } from '~/shared/types';
import type { Connection } from '~/shared/types';
import { getCredentialUsername } from '~/content/connections/utils';

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
    connectionToEdit
      ? {
          ...connectionToEdit,
          password: connectionToEdit?.password ?? '',
        }
      : {
          database: '',
          engine: null,
          host: '',
          id: '',
          name: '',
          password: '',
          passwordStorage: 'alwaysAsk',
          port: null,
          user: '',
        },
  );

  const getChangeHandler =
    <K extends keyof FormSchema>(key: K) =>
    (value: FormSchema[K]) => {
      setForm((formValues) => ({ ...formValues, [key]: value }));
    };

  return (
    <>
      <form
        className="mx-auto grid w-[400px] gap-2"
        onSubmit={(event) => {
          event.preventDefault();

          const connection = connectionSchema.parse(form);

          if (form.passwordStorage !== 'localStorage') {
            connection.password = null;
          }

          connectionToEdit
            ? updateConnection(connectionToEdit.id, connection)
            : addConnection(connection);

          exit();
        }}
      >
        <ThreeColumns
          left={<Button icon={<ArrowBack />} onClick={exit} />}
          middle={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
              {mode === 'add' ? 'Add' : 'Edit'} Connection
            </div>
          }
          right={
            connectionToEdit !== null && (
              <ConfirmDeletePopover
                onConfirm={() => {
                  removeConnection(connectionToEdit.id);
                  exit();
                }}
                renderTrigger={({ ref }) => (
                  <Button color="danger" icon={<DeleteOutline />} ref={ref} />
                )}
                text="Delete connection"
              />
            )
          }
        />
        <Field label="Engine">
          <Select<Connection['engine']>
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
              onChange={(value) => getChangeHandler('port')(value ? Number(value) : null)}
              value={form.port === null ? '' : String(form.port)}
            />
          </Field>
        </div>
        <Field label="Password storage">
          <ButtonSelect<'alwaysAsk' | 'localStorage'>
            equalWidth
            fullWidth
            onChange={getChangeHandler('passwordStorage')}
            options={[
              {
                button: { label: 'Always ask / Keychain' },
                value: 'alwaysAsk',
              },
              {
                button: { label: 'Browser storage' },
                value: 'localStorage',
              },
            ]}
            required
            value={form.passwordStorage}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="User">
            <Input onChange={getChangeHandler('user')} value={form.user} />
          </Field>
          <Field label="Password">
            <Input autoComplete="username" className="hidden" value={getCredentialUsername(form)} />
            <Input
              autoComplete="current-password"
              disabled={form.passwordStorage === 'alwaysAsk'}
              onChange={getChangeHandler('password')}
              type="password"
              value={form.passwordStorage === 'alwaysAsk' ? '' : form.password}
            />
          </Field>
        </div>
        <Field label="Default database">
          <Input onChange={getChangeHandler('database')} value={form.database} />
        </Field>
        <TestConnection form={form} />
        <Button
          disabled={!isFormValid(form)}
          icon={<Done />}
          label={mode === 'add' ? 'Add' : 'Save'}
          type="submit"
          variant="filled"
        />
      </form>
    </>
  );
};
