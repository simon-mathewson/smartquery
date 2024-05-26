import { ArrowBack, DeleteOutline, Done } from '@mui/icons-material';
import { cloneDeep, set } from 'lodash';
import React, { useState } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { getCredentialUsername } from '~/content/connections/utils';
import { Button } from '~/shared/components/Button/Button';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { ConfirmDeletePopover } from '~/shared/components/ConfirmDeletePopover/ConfirmDeletePopover';
import { Field } from '~/shared/components/Field/Field';
import { Input } from '~/shared/components/Input/Input';
import { Select } from '~/shared/components/Select/Select';
import { ThreeColumns } from '~/shared/components/ThreeColumns/ThreeColumns';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import type { Connection } from '~/shared/types';
import { SshFormSection } from './ssh/SshFormSection';
import { TestConnection } from './test/TestConnection';
import type { FormSchema } from './utils';
import { getConnectionFromForm, getDefaultPort, isFormValid } from './utils';
import { CredentialInput } from '~/shared/components/CredentialInput/CredentialInput';

export type ConnectionFormProps = {
  connectionToEditIndex: number | null;
  exit: () => void;
  hideBackButton: boolean;
};

export const ConnectionForm: React.FC<ConnectionFormProps> = (props) => {
  const { connectionToEditIndex, exit, hideBackButton } = props;

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
          ssh: connectionToEdit?.ssh
            ? {
                ...connectionToEdit.ssh,
                credentialType:
                  connectionToEdit.ssh.password !== undefined ? 'password' : 'privateKey',
                password: connectionToEdit.ssh.password ?? '',
                privateKey: connectionToEdit.ssh.privateKey ?? '',
              }
            : null,
        }
      : {
          credentialStorage: 'alwaysAsk',
          database: '',
          engine: null,
          host: '',
          id: '',
          name: '',
          password: '',
          port: null,
          ssh: null,
          user: '',
        },
  );

  const getChangeHandler = (key: string) => (value: unknown) => {
    setForm((formValues) => {
      const newValues = cloneDeep(formValues);
      set(newValues, key, value);
      return newValues;
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const connection = getConnectionFromForm(form);

    connectionToEdit
      ? updateConnection(connectionToEdit.id, connection)
      : addConnection(connection);

    exit();
  };

  return (
    <>
      <form className="mx-auto grid w-[320px] gap-2" onSubmit={onSubmit}>
        <ThreeColumns
          left={!hideBackButton && <Button icon={<ArrowBack />} onClick={exit} />}
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
              placeholder={String(getDefaultPort(form.engine) ?? '')}
              value={form.port === null ? '' : String(form.port)}
            />
          </Field>
        </div>
        <Field label="Password storage">
          <ButtonSelect<'alwaysAsk' | 'localStorage'>
            equalWidth
            fullWidth
            onChange={getChangeHandler('credentialStorage')}
            options={[
              {
                button: { label: 'None / Keychain' },
                value: 'alwaysAsk',
              },
              {
                button: { label: 'Browser storage' },
                value: 'localStorage',
              },
            ]}
            required
            value={form.credentialStorage}
          />
        </Field>
        <Field label="User">
          <Input onChange={getChangeHandler('user')} value={form.user} />
        </Field>
        {form.credentialStorage === 'localStorage' && (
          <Field label="Password">
            <CredentialInput
              onChange={getChangeHandler('password')}
              username={getCredentialUsername(form)}
              value={form.password}
            />
          </Field>
        )}
        <Field label="Default database">
          <Input onChange={getChangeHandler('database')} value={form.database} />
        </Field>
        <SshFormSection form={form} getChangeHandler={getChangeHandler} />
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
