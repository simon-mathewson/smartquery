import { ArrowBack, ArrowForwardOutlined } from '@mui/icons-material';
import React, { useCallback, useState } from 'react';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { Input } from '~/shared/components/input/Input';
import { Page } from '~/shared/components/page/Page';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../Context';
import { useLocation } from 'wouter';

export const Login: React.FC = () => {
  const [, navigate] = useLocation();
  const auth = useDefinedContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      await auth.logIn(email, password);

      navigate(routes.root());
    },
    [auth, email, navigate, password],
  );

  return (
    <Page title="Login">
      <Card htmlProps={{ className: 'w-full max-w-[356px]' }}>
        <Header
          left={<Button element="link" htmlProps={{ href: routes.root() }} icon={<ArrowBack />} />}
          middle={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
              Log in
            </div>
          }
        />
        <form className="flex flex-col gap-2 py-2" onSubmit={handleSubmit}>
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
    </Page>
  );
};
