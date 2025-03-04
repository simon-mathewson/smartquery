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
import { Header } from '~/shared/components/header/Header';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Connection } from '~/shared/types';
import { SshFormSection } from './ssh/SshFormSection';
import { TestConnection } from './test/TestConnection';
import type { FormValues } from './utils';
import { getConnectionFromForm, getDefaultPort, getInitialFormValues, isFormValid } from './utils';
import { CredentialInput } from '~/shared/components/credentialInput/CredentialInput';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { focusFirstControl } from '~/shared/utils/focusFirstControl/focusFirstControl';
import { FileHandleSelect } from '~/shared/components/fileHandleSelect/FileHandleSelect';
import { ToastContext } from '~/content/toast/Context';
import { assert } from 'ts-essentials';
import { storeFileHandle } from '~/shared/utils/fileHandles/fileHandles';

export type ConnectionFormProps = {
  connectionToEditId?: string;
  exit: () => void;
  hideBackButton?: boolean;
};

export const ConnectionForm: React.FC<ConnectionFormProps> = (props) => {
  const { connectionToEditId, exit, hideBackButton } = props;

  const toast = useDefinedContext(ToastContext);

  const mode = connectionToEditId ? 'edit' : 'add';

  const { addConnection, connections, removeConnection, updateConnection } =
    useDefinedContext(ConnectionsContext);
  const connectionToEdit = connectionToEditId
    ? connections.find((connection) => connection.id === connectionToEditId) ?? null
    : null;

  const [formValues, setFormValues] = useState<FormValues>();

  useEffectOnce(() => {
    getInitialFormValues(connectionToEdit, toast).then(setFormValues);
  });

  const setFormValue = (key: string, value: unknown) => {
    setFormValues((formValues) => {
      assert(formValues);

      const newValues = cloneDeep(formValues);
      set(newValues, key, value);

      return newValues;
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    assert(formValues);

    event.preventDefault();

    formValues.id ||= String(connections.length);

    const connection = getConnectionFromForm(formValues);

    if (formValues.type === 'file') {
      assert(formValues.fileHandle);
      await storeFileHandle(formValues.fileHandle, formValues.id);
    }

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

  if (!formValues) return null;

  return (
    <>
      <form className="grid w-[320px] gap-2" onSubmit={onSubmit} ref={formRef}>
        <Header
          left={
            !hideBackButton && (
              <Button htmlProps={{ 'aria-label': 'Cancel', onClick: exit }} icon={<ArrowBack />} />
            )
          }
          middle={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
              {mode === 'add' ? 'Add' : 'Edit'} Connection
            </div>
          }
          right={
            connectionToEdit && (
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
          <ButtonSelect<Connection['engine'] | null>
            equalWidth
            fullWidth
            onChange={(value) => {
              setFormValue('engine', value);
              setFormValue('type', value === 'sqlite' ? 'file' : 'remote');
            }}
            options={[
              {
                button: { label: 'MySQL', htmlProps: { autoFocus: true } },
                value: 'mysql',
              },
              {
                button: { label: 'PostgreSQL' },
                value: 'postgresql',
              },
              {
                button: { label: 'SQLite' },
                value: 'sqlite',
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
        {formValues.engine === 'sqlite' ? (
          <Field label="Database file">
            <FileHandleSelect
              options={{
                types: [
                  {
                    description: 'SQLite database',
                    accept: {
                      'application/vnd.sqlite3': ['.sqlite', '.sqlite3', '.db'],
                    },
                  },
                ],
              }}
              value={formValues.fileHandle}
              onChange={(value) => setFormValue('fileHandle', value)}
            />
          </Field>
        ) : (
          <>
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
                      formValues.port ??
                      (formValues.engine ? getDefaultPort(formValues.engine) : -1),
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
            {formValues.engine === 'postgresql' && (
              <Field label="Default schema">
                <Input
                  htmlProps={{ value: formValues.schema }}
                  onChange={(value) => setFormValue('schema', value)}
                />
              </Field>
            )}
            <SshFormSection
              formValues={formValues}
              htmlProps={{ className: 'my-2' }}
              setFormValue={setFormValue}
            />
            <TestConnection formValues={formValues} />
          </>
        )}
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
