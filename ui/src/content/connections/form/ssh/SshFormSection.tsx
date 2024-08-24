import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { Field } from '~/shared/components/field/Field';
import { type FormSchema } from '../utils';
import { Input } from '~/shared/components/input/Input';
import { getCredentialUsername } from '~/content/connections/utils';
import { CredentialInput } from '~/shared/components/credentialInput/CredentialInput';
import { isNil } from 'lodash';
import { defaultSshPort } from '../constants';

export type SshFormSectionProps = {
  form: FormSchema;
  getChangeHandler: (key: string) => (value: unknown) => void;
};

export const SshFormSection: React.FC<SshFormSectionProps> = (props) => {
  const { form, getChangeHandler } = props;

  const showPasswordField =
    form.ssh?.credentialStorage === 'localStorage' && form.ssh?.credentialType === 'password';
  const showPrivateKeyField =
    form.ssh?.credentialStorage === 'localStorage' && form.ssh?.credentialType === 'privateKey';

  return (
    <>
      <Field htmlProps={{ className: 'mt-2' }}>
        <ButtonSelect<true>
          equalWidth
          fullWidth
          onChange={(newSshEnabled) =>
            getChangeHandler('ssh')(
              newSshEnabled
                ? ({
                    credentialStorage: 'alwaysAsk',
                    credentialType: 'password',
                    host: '',
                    password: '',
                    port: null,
                    privateKey: '',
                    user: '',
                  } as FormSchema['ssh'])
                : null,
            )
          }
          options={[
            {
              button: { label: 'Connect via SSH' },
              value: true,
            },
          ]}
          value={form.ssh !== null || undefined}
        />
      </Field>
      {form.ssh && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Host">
              <Input
                htmlProps={{ value: form.ssh?.host ?? '' }}
                onChange={getChangeHandler('ssh.host')}
              />
            </Field>
            <Field label="Port">
              <Input
                htmlProps={{
                  placeholder: String(defaultSshPort),
                  value: isNil(form.ssh?.port) ? '' : String(form.ssh.port),
                }}
                onChange={(value) => getChangeHandler('ssh.port')(value ? Number(value) : null)}
              />
            </Field>
          </div>
          <Field label="Credential type">
            <ButtonSelect<'privateKey' | 'password'>
              equalWidth
              fullWidth
              onChange={getChangeHandler('ssh.credentialType')}
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
              value={form.ssh.credentialType}
            />
          </Field>
          <Field
            label={`${
              form.ssh.credentialType === 'privateKey' ? 'Private key' : 'Password'
            } storage`}
          >
            <ButtonSelect<'alwaysAsk' | 'localStorage'>
              equalWidth
              fullWidth
              onChange={getChangeHandler('ssh.credentialStorage')}
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
              value={form.ssh.credentialStorage}
            />
          </Field>
          <Field label="User">
            <Input htmlProps={{ value: form.ssh.user }} onChange={getChangeHandler('ssh.user')} />
          </Field>
          {showPasswordField && (
            <Field label="Password">
              <CredentialInput
                onChange={getChangeHandler('ssh.password')}
                username={getCredentialUsername({
                  ...form.ssh,
                  port: form.ssh.port ?? defaultSshPort,
                })}
                htmlProps={{
                  value: form.ssh.credentialStorage === 'alwaysAsk' ? '' : form.ssh.password,
                }}
              />
            </Field>
          )}
          {showPrivateKeyField && (
            <Field label="Private key">
              <CredentialInput
                onChange={getChangeHandler('ssh.privateKey')}
                username={getCredentialUsername({
                  ...form.ssh,
                  port: form.ssh.port ?? defaultSshPort,
                })}
                htmlProps={{ value: form.ssh.privateKey }}
              />
            </Field>
          )}
        </>
      )}
    </>
  );
};
