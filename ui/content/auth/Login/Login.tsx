import {
  ArrowBack,
  ArrowForwardOutlined,
  MoreVertOutlined,
  PersonAddAlt1Outlined,
} from '@mui/icons-material';
import React, { useCallback, useEffect, useState } from 'react';
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
import { parseCredentialUsername, type Credential } from '@/utils/credentials';
import { DropdownMenu } from '~/shared/components/dropdownMenu/DropdownMenu';

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
  const [storeInKeychain, setStoreInKeychain] = useState(false);

  const [suggestedUser, setSuggestedUser] = useState<{
    credential: Credential;
    email: string;
  } | null>(null);

  useEffect(() => {
    void credentials.getUserCredential().then((credential) => {
      if (!credential) return;

      setSuggestedUser({
        credential,
        email: parseCredentialUsername(credential.username).rawUsername,
      });
    });
  }, [credentials]);

  const login = useCallback(
    async (emailToSubmit: string, passwordToSubmit: string) => {
      await auth.logIn(emailToSubmit, passwordToSubmit, {
        onSuccess: async () => {
          if (storeInKeychain && isNative) {
            await credentials.storeCredential({
              username: emailToSubmit,
              password: passwordToSubmit,
              type: 'user',
            });
          }
          onSuccess();
        },
      });
    },
    [auth, storeInKeychain, credentials, onSuccess],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void login(email, password);
    },
    [email, password, login],
  );

  return (
    <>
      {suggestedUser && (
        <ActionList
          actions={[
            {
              element: 'div',
              hint: 'Stored in keychain',
              label: `Continue as ${suggestedUser.email}`,
              icon: <ArrowForwardOutlined />,
              htmlProps: {
                onClick: () => {
                  void login(suggestedUser.email, suggestedUser.credential.password);
                },
              },
              suffix: (
                <DropdownMenu
                  items={[
                    {
                      color: 'danger',
                      label: 'Remove from keychain',
                      value: 'remove',
                      onSelect: async () => {
                        await credentials.removeUserCredential(suggestedUser.email);
                        setSuggestedUser(null);
                      },
                    },
                  ]}
                  trigger={{
                    element: 'button',
                    icon: <MoreVertOutlined />,
                  }}
                />
              ),
            },
          ]}
        />
      )}
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
                label="Store in keychain"
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
            icon: <PersonAddAlt1Outlined />,
            htmlProps: {
              onClick: onShowSignup,
            },
          },
        ]}
      />
    </>
  );
};
