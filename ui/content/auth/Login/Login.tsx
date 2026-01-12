import { ArrowBack, ArrowForwardOutlined, PersonAddAlt1Outlined } from '@mui/icons-material';
import React, { useCallback, useState } from 'react';
import { routes } from '~/router/routes';
import { ActionList } from '~/shared/components/actionList/ActionList';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { Input } from '~/shared/components/input/Input';
import { Toggle } from '~/shared/components/toggle/Toggle';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { isNative } from '~/content/native/useNative';
import { CredentialsContext } from '~/content/credentials/Context';
import { AuthContext } from '../Context';

export type LoginProps = {
  onBack: () => void;
  onSuccess: () => void;
  onShowSignup: () => void;
};

export const Login: React.FC<LoginProps> = (props) => {
  const { onBack, onSuccess, onShowSignup } = props;

  const auth = useDefinedContext(AuthContext);
  const credentials = useDefinedContext(CredentialsContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeInKeychain, setStoreInKeychain] = useState(true);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      await auth.logIn(email, password, {
        onSuccess: async () => {
          if (storeInKeychain && isNative) {
            await credentials.storeCredential(email, password, true);
          }
          onSuccess();
        },
      });
    },
    [auth, email, onSuccess, password, storeInKeychain, credentials],
  );

  return (
    <>
      <Card htmlProps={{ className: 'flex flex-col w-full' }}>
        <Header
          left={<Button htmlProps={{ onClick: onBack }} icon={<ArrowBack />} />}
          middle={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
              Log in
            </div>
          }
        />
        <form className="flex flex-col gap-2 p-1" onSubmit={handleSubmit}>
          <Field label="Email">
            <Input
              htmlProps={{ autoFocus: true, type: 'email', value: email }}
              onChange={setEmail}
            />
          </Field>
          <Field label="Password">
            <Input
              htmlProps={{
                autoComplete: 'current-passord',
                minLength: 12,
                type: 'password',
                value: password,
              }}
              onChange={setPassword}
            />
          </Field>
          {isNative && (
            <Field htmlProps={{ className: 'mt-2' }}>
              <Toggle
                label="Store in Keychain"
                value={storeInKeychain}
                onChange={setStoreInKeychain}
              />
            </Field>
          )}
          <Button
            element="link"
            htmlProps={{
              className: 'mt-2',
              href: routes.requestResetPassword(email),
            }}
            label="Reset password"
          />
          <Button
            htmlProps={{
              disabled: !email || !password,
              type: 'submit',
            }}
            icon={<ArrowForwardOutlined />}
            label="Log in"
            variant="filled"
          />
        </form>
      </Card>
      <ActionList
        actions={[
          {
            hint: 'Sign up',
            label: "Don't have an account yet?",
            icon: PersonAddAlt1Outlined,
            onClick: onShowSignup,
          },
        ]}
      />
    </>
  );
};
