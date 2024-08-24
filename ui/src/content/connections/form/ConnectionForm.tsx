import { ArrowBack, DeleteOutline, Done } from '@mui/icons-material';
import { cloneDeep, set } from 'lodash';
import React, { useRef, useState } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { getCredentialUsername } from '~/content/connections/utils';
import { Button } from '~/shared/components/button/Button';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { ConfirmDeletePopover } from '~/shared/components/confirmDeletePopover/ConfirmDeletePopover';
import { Field } from '~/shared/components/field/Field';
import { Input } from '~/shared/components/input/Input';
import { Select } from '~/shared/components/select/Select';
import { Header } from '~/shared/components/header/Header';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Connection } from '~/shared/types';
import { SshFormSection } from './ssh/SshFormSection';
import { TestConnection } from './test/TestConnection';
import type { FormSchema } from './utils';
import { getConnectionFromForm, getDefaultPort, isFormValid } from './utils';
import { CredentialInput } from '~/shared/components/credentialInput/CredentialInput';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { focusFirstControl } from '~/shared/utils/focusFirstControl/focusFirstControl';

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

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffectOnce(() => {
    setTimeout(() => {
      if (!formRef.current) return;
      focusFirstControl(formRef.current);
    });
  });

  return (
    <>
      <form className="grid w-[320px] gap-2" onSubmit={onSubmit} ref={formRef}>
        <Header
          left={!hideBackButton && <Button htmlProps={{ onClick: exit }} icon={<ArrowBack />} />}
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
                renderTrigger={(htmlProps) => (
                  <Button color="danger" htmlProps={htmlProps} icon={<DeleteOutline />} />
                )}
                text="Delete connection"
              />
            )
          }
        />
        <Field label="Engine">
          <Select<Connection['engine']>
            htmlProps={{ autoFocus: true }}
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
          <Input htmlProps={{ value: form.name }} onChange={getChangeHandler('name')} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Host">
            <Input htmlProps={{ value: form.host }} onChange={getChangeHandler('host')} />
          </Field>
          <Field label="Port">
            <Input
              htmlProps={{
                placeholder: form.engine ? String(getDefaultPort(form.engine)) : '',
                value: form.port === null ? '' : String(form.port),
              }}
              onChange={(value) => getChangeHandler('port')(value ? Number(value) : null)}
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
          <Input htmlProps={{ value: form.user }} onChange={getChangeHandler('user')} />
        </Field>
        {form.credentialStorage === 'localStorage' && (
          <Field label="Password">
            <CredentialInput
              htmlProps={{ value: form.password }}
              onChange={getChangeHandler('password')}
              username={getCredentialUsername({
                ...form,
                port: form.port ?? (form.engine ? getDefaultPort(form.engine) : -1),
              })}
            />
          </Field>
        )}
        <Field label="Default database">
          <Input htmlProps={{ value: form.database }} onChange={getChangeHandler('database')} />
        </Field>
        <SshFormSection
          form={form}
          getChangeHandler={getChangeHandler}
          htmlProps={{ className: 'my-2' }}
        />
        <TestConnection form={form} />
        <Button
          htmlProps={{ disabled: !isFormValid(form), type: 'submit' }}
          icon={<Done />}
          label={mode === 'add' ? 'Add' : 'Save'}
          variant="filled"
        />
      </form>
    </>
  );
};
