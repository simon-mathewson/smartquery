import {
  ArrowBack,
  DeleteOutline,
  Done,
  InsertDriveFileOutlined as FileIcon,
} from '@mui/icons-material';
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
import { SshFormSection } from './ssh/SshFormSection';
import { TestConnection } from './test/TestConnection';
import type { FormValues } from './utils';
import { getConnectionFromForm, getDefaultPort, getInitialFormValues, isFormValid } from './utils';
import { CredentialInput } from '~/shared/components/credentialInput/CredentialInput';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { focusFirstControl } from '~/shared/utils/focusFirstControl/focusFirstControl';
import { FileHandleSelect } from '~/shared/components/fileHandleSelect/FileHandleSelect';
import { assert } from 'ts-essentials';
import { v4 as uuid } from 'uuid';
import { SqliteContext } from '~/content/sqlite/Context';
import { sqliteChooseFileOptions } from '~/shared/utils/sqlite/sqlite';
import { Setup as LinkSetup } from '~/content/link/setup/Setup';
import { sqliteDemoConnectionId } from '~/content/home/constants';
import { AuthContext } from '~/content/auth/Context';
import { AnalyticsContext } from '~/content/analytics/Context';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';

export type ConnectionFormProps = {
  connectionToEditId?: string;
  exit: () => void;
  hideBackButton?: boolean;
  htmlProps?: React.HTMLAttributes<HTMLElement>;
};

const engineLabels = {
  mysql: 'MySQL',
  postgres: 'PostgreSQL',
  sqlite: 'SQLite',
};

export const ConnectionForm: React.FC<ConnectionFormProps> = (props) => {
  const { connectionToEditId, exit, hideBackButton, htmlProps } = props;

  const [, navigate] = useLocation();
  const { track } = useDefinedContext(AnalyticsContext);
  const { user } = useDefinedContext(AuthContext);

  const { getSqliteContent, storeSqliteContent } = useDefinedContext(SqliteContext);

  const mode = connectionToEditId ? 'edit' : 'add';

  const { addConnection, connections, removeConnection, updateConnection } =
    useDefinedContext(ConnectionsContext);
  const connectionToEdit = connectionToEditId
    ? connections.find((connection) => connection.id === connectionToEditId) ?? null
    : null;

  const [formValues, setFormValues] = useState<FormValues>();

  const [isCloudConnection, setIsCloudConnection] = useState<boolean>();

  useEffectOnce(() => {
    getInitialFormValues({ connectionToEdit, getSqliteContent, user }).then((initialFormValues) => {
      setFormValues(initialFormValues);
      setIsCloudConnection(
        initialFormValues.storageLocation === 'cloud' && connectionToEdit !== null,
      );
    });
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

    const finalFormValues = { ...formValues, id: formValues.id || uuid() };

    const connection = getConnectionFromForm(finalFormValues);

    if (finalFormValues.type === 'file') {
      assert(finalFormValues.fileHandle);
      await storeSqliteContent(finalFormValues.fileHandle, finalFormValues.id);
    }

    if (connectionToEdit) {
      track('connection_form_update');
      void updateConnection(connectionToEdit.id, connection, exit);
    } else {
      track('connection_form_add');
      await addConnection(connection, () =>
        setTimeout(() => {
          exit();
          navigate(
            routes.database({
              connectionId: connection.id,
              database: connection.database,
              schema: connection.engine === 'postgres' ? connection.schema : '',
            }),
          );
        }),
      );
    }
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
      <form className="grid w-[320px] gap-2" onSubmit={onSubmit} ref={formRef} {...htmlProps}>
        <Header
          left={
            !hideBackButton && (
              <Button
                htmlProps={{ 'aria-label': 'Cancel', onClick: exit }}
                icon={<ArrowBack />}
                tooltip="Cancel"
              />
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
                  track('connection_form_delete');
                  exit();
                }}
                renderTrigger={(htmlProps) => (
                  <Button
                    color="danger"
                    htmlProps={htmlProps}
                    icon={<DeleteOutline />}
                    tooltip="Delete"
                  />
                )}
                text="Delete connection"
              />
            )
          }
        />
        <Field label="Engine">
          <ButtonSelect<FormValues['engine'] | null>
            fullWidth
            onChange={(value) => {
              setFormValue('engine', value);
              setFormValue('type', value === 'sqlite' ? 'file' : 'remote');
              if (value === 'sqlite') {
                setFormValue('storageLocation', 'local');

                if (formValues.type === 'remote' && formValues.credentialStorage === 'encrypted') {
                  setFormValue('credentialStorage', 'alwaysAsk');
                }
              }
            }}
            options={(['mysql', 'postgres', 'sqlite'] as const).map((engine, index) => ({
              button: {
                label: engineLabels[engine],
                htmlProps: {
                  autoFocus: index === 0,
                  disabled: Boolean(connectionToEditId),
                },
              },
              value: engine,
            }))}
            value={formValues.engine}
          />
        </Field>
        {formValues.type === 'remote' && (
          <LinkSetup databaseLabel={engineLabels[formValues.engine]} />
        )}
        <Field label="Storage location">
          <ButtonSelect<FormValues['storageLocation'] | null>
            fullWidth
            onChange={(value) => {
              setFormValue('storageLocation', value);
              if (
                value === 'local' &&
                formValues.type === 'remote' &&
                formValues.credentialStorage === 'encrypted'
              ) {
                setFormValue('credentialStorage', 'alwaysAsk');
              }
            }}
            options={[
              {
                button: {
                  label: 'Cloud',
                  htmlProps: {
                    autoFocus: true,
                    disabled: formValues.type === 'file' || !user,
                  },
                  tooltip: (() => {
                    if (formValues.type === 'file') {
                      return 'Storing SQLite in cloud is not supported';
                    } else if (!user) {
                      return 'Log in to store in your account and sync across devices';
                    } else {
                      return 'Store in your account to sync across devices';
                    }
                  })(),
                },
                value: 'cloud',
              },
              {
                button: {
                  label: 'Local',
                  htmlProps: {
                    disabled: isCloudConnection,
                  },
                  tooltip: isCloudConnection
                    ? 'Switching to local storage not supported for cloud connections'
                    : 'Store on this device only',
                },
                value: 'local',
              },
            ]}
            required
            value={formValues.storageLocation}
          />
        </Field>
        {formValues.type === 'remote' && (
          <>
            <Field label="Password storage">
              <ButtonSelect<'alwaysAsk' | 'encrypted' | 'plain'>
                fullWidth
                onChange={(value) => setFormValue('credentialStorage', value)}
                options={[
                  {
                    button: {
                      htmlProps: { disabled: formValues.storageLocation !== 'cloud' },
                      label: 'Encrypted',
                      tooltip:
                        formValues.storageLocation !== 'cloud'
                          ? 'Only supported when storing in cloud'
                          : 'Stores credentials in your account and encrypts them based on your main password. Requires entering main password every time you connect. Storing and auto-filling main password with browser keychain is supported.',
                    },
                    value: 'encrypted',
                  },
                  {
                    button: {
                      label: 'Always ask',
                      tooltip:
                        'Does not store credentials, requires entering them every time you connect. Storing and auto-filling credentials with browser keychain is supported.',
                    },
                    value: 'alwaysAsk',
                  },
                  {
                    button: {
                      label: 'Plain',
                      tooltip:
                        'Stores credentials in plain text. Do not use for sensitive credentials.',
                    },
                    value: 'plain',
                  },
                ]}
                required
                value={formValues.credentialStorage}
              />
            </Field>
          </>
        )}
        <Field label="Name">
          <Input
            htmlProps={{ value: formValues.name }}
            onChange={(value) => setFormValue('name', value)}
          />
        </Field>
        {formValues.engine === 'sqlite' ? (
          <Field
            hint="Database will be read from and written to the file system."
            label="Database file"
          >
            {formValues.id === sqliteDemoConnectionId ? (
              <div className="flex w-full items-center gap-2">
                <FileIcon className="!text-[20px] text-textTertiary" />
                <div className="flex-1 text-ellipsis text-sm font-medium text-textSecondary">
                  demo.sqlite
                </div>
              </div>
            ) : (
              <FileHandleSelect
                options={sqliteChooseFileOptions}
                value={formValues.fileHandle}
                onChange={(value) => setFormValue('fileHandle', value)}
              />
            )}
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
                    value: formValues.port === null ? '' : String(formValues.port ?? ''),
                  }}
                  onChange={(value) => setFormValue('port', value ? Number(value) : null)}
                />
              </Field>
            </div>
            <Field label="User">
              <Input
                htmlProps={{ value: formValues.user }}
                onChange={(value) => setFormValue('user', value)}
              />
            </Field>
            {formValues.credentialStorage !== 'alwaysAsk' && (
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
            {formValues.engine === 'postgres' && (
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
