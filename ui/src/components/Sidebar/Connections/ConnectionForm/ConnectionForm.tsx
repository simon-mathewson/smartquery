import { ArrowBack, Close, DeleteOutline, Done } from '@mui/icons-material';
import { Button } from '~/components/shared/Button/Button';
import { Input } from '~/components/shared/Input/Input';
import { OverlayCard } from '~/components/shared/OverlayCard/OverlayCard';
import { GlobalContext } from '~/contexts/GlobalContext';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import React, { useRef, useState } from 'react';
import { Header } from '../../../shared/Header/Header';
import { TestConnection } from './TestConnection/TestConnection';
import { FormSchema, connectionSchema, isFormValid } from './utils';

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

  const [form, setForm] = useState<FormSchema>(
    connectionToEdit ?? {
      database: '',
      host: '',
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

          setConnections((connections) =>
            connectionToEdit
              ? connections.map((c) => (c === connectionToEdit ? connection : c))
              : [...connections, connection],
          );
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
                      <div className="grid grid-cols-2 gap-2">
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
