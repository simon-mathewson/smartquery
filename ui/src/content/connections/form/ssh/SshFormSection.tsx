import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { Field } from '~/shared/components/field/Field';
import { type FormValues } from '../utils';
import { Input } from '~/shared/components/input/Input';
import { getCredentialUsername } from '~/content/connections/utils';
import { CredentialInput } from '~/shared/components/credentialInput/CredentialInput';
import { isNil } from 'lodash';
import { defaultSshPort } from '../constants';
import classNames from 'classnames';
import { Toggle } from '~/shared/components/toggle/Toggle';

export type SshFormSectionProps = {
  formValues: Pick<Extract<FormValues, { type: 'remote' }>, 'credentialStorage' | 'ssh'>;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
  setFormValue: (key: string, value: unknown) => void;
};

export const SshFormSection: React.FC<SshFormSectionProps> = (props) => {
  const { formValues, htmlProps, setFormValue } = props;

  const showPasswordField =
    formValues.credentialStorage !== 'alwaysAsk' && formValues.ssh?.credentialType === 'password';
  const showPrivateKeyField =
    formValues.credentialStorage !== 'alwaysAsk' && formValues.ssh?.credentialType === 'privateKey';

  return (
    <div className={classNames('grid gap-2', htmlProps?.className)}>
      <Field>
        <Toggle
          label="Connect via SSH"
          onChange={(newSshEnabled) =>
            setFormValue(
              'ssh',
              newSshEnabled
                ? ({
                    credentialStorage: 'alwaysAsk',
                    credentialType: 'password',
                    host: '',
                    password: '',
                    port: null,
                    privateKey: '',
                    user: '',
                  } as Extract<FormValues, { type: 'remote' }>['ssh'])
                : null,
            )
          }
          value={Boolean(formValues.ssh)}
        />
      </Field>
      {formValues.ssh && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Host">
              <Input
                htmlProps={{ value: formValues.ssh?.host ?? '' }}
                onChange={(value) => setFormValue('ssh.host', value)}
              />
            </Field>
            <Field label="Port">
              <Input
                htmlProps={{
                  placeholder: String(defaultSshPort),
                  type: 'number',
                  value: isNil(formValues.ssh?.port) ? '' : String(formValues.ssh.port),
                }}
                onChange={(value) => setFormValue('ssh.port', value ? Number(value) : null)}
              />
            </Field>
          </div>
          <Field label="Credential type">
            <ButtonSelect<'privateKey' | 'password'>
              fullWidth
              onChange={(value) => setFormValue('ssh.credentialType', value)}
              options={[
                {
                  button: { label: 'Password' },
                  value: 'password',
                },
                {
                  button: {
                    label: 'Private key',
                  },
                  value: 'privateKey',
                },
              ]}
              required
              value={formValues.ssh.credentialType}
            />
          </Field>
          <Field label="User">
            <Input
              htmlProps={{ value: formValues.ssh.user }}
              onChange={(value) => setFormValue('ssh.user', value)}
            />
          </Field>
          {showPasswordField && (
            <Field label="Password">
              <CredentialInput
                onChange={(value) => setFormValue('ssh.password', value)}
                username={getCredentialUsername({
                  ...formValues.ssh,
                  port: formValues.ssh.port ?? defaultSshPort,
                })}
                htmlProps={{
                  value:
                    formValues.credentialStorage === 'alwaysAsk' ? '' : formValues.ssh.password,
                }}
              />
            </Field>
          )}
          {showPrivateKeyField && (
            <Field label="Private key">
              <CredentialInput
                onChange={(value) => setFormValue('ssh.privateKey', value)}
                username={getCredentialUsername({
                  ...formValues.ssh,
                  port: formValues.ssh.port ?? defaultSshPort,
                })}
                htmlProps={{ value: formValues.ssh.privateKey }}
              />
            </Field>
          )}
        </>
      )}
    </div>
  );
};
