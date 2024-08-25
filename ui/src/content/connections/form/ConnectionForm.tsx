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
import type { FormValues } from './utils';
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

  const [formValues, setFormValues] = useState<FormValues>(
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

  const setFormValue = (key: string, value: unknown) => {
    setFormValues((formValues) => {
      const newValues = cloneDeep(formValues);
      set(newValues, key, value);
      return newValues;
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const connection = getConnectionFromForm(formValues);

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
            onChange={(value) => setFormValue('engine', value)}
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
            value={formValues.engine}
          />
        </Field>
        <Field label="Name">
          <Input
            htmlProps={{ value: formValues.name }}
            onChange={(value) => setFormValue('name', value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Host">
            <Input
              htmlProps={{ value: formValues.host }}
              onChange={(value) => setFormValue('host', value)}
            />
          </Field>
          <Field label="Port">
            <Input
              htmlProps={{
                placeholder: formValues.engine ? String(getDefaultPort(formValues.engine)) : '',
                value: formValues.port === null ? '' : String(formValues.port),
              }}
              onChange={(value) => setFormValue('port', value ? Number(value) : null)}
            />
          </Field>
        </div>
        <Field label="Password storage">
          <ButtonSelect<'alwaysAsk' | 'localStorage'>
            equalWidth
            fullWidth
            onChange={(value) => setFormValue('credentialStorage', value)}
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
            value={formValues.credentialStorage}
          />
        </Field>
        <Field label="User">
          <Input
            htmlProps={{ value: formValues.user }}
            onChange={(value) => setFormValue('user', value)}
          />
        </Field>
        {formValues.credentialStorage === 'localStorage' && (
          <Field label="Password">
            <CredentialInput
              htmlProps={{ value: formValues.password }}
              onChange={(value) => setFormValue('password', value)}
              username={getCredentialUsername({
                ...formValues,
                port:
                  formValues.port ?? (formValues.engine ? getDefaultPort(formValues.engine) : -1),
              })}
            />
          </Field>
        )}
        <Field label="Default database">
          <Input
            htmlProps={{ value: formValues.database }}
            onChange={(value) => setFormValue('database', value)}
          />
        </Field>
        <SshFormSection
          formValues={formValues}
          htmlProps={{ className: 'my-2' }}
          setFormValue={setFormValue}
        />
        <TestConnection form={formValues} />
        <Button
          htmlProps={{ disabled: !isFormValid(formValues), type: 'submit' }}
          icon={<Done />}
          label={mode === 'add' ? 'Add' : 'Save'}
          variant="filled"
        />
      </form>
    </>
  );
};
