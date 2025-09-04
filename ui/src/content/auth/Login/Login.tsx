import { ArrowBack, ArrowForwardOutlined, PersonAddAlt1Outlined } from '@mui/icons-material';
import React, { useCallback, useState } from 'react';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { Input } from '~/shared/components/input/Input';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../Context';
import { useLocation } from 'wouter';
import { ActionList } from '~/shared/components/actionList/ActionList';

export type LoginProps = {
  onBack: () => void;
  onSuccess: () => void;
  onShowSignup: () => void;
};

export const Login: React.FC<LoginProps> = (props) => {
  const { onBack, onSuccess, onShowSignup } = props;

  const [, navigate] = useLocation();
  const auth = useDefinedContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      await auth.logIn(email, password);

      onSuccess();
    },
    [auth, email, navigate, password],
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
