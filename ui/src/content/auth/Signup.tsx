import { ArrowBack } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { Input } from '~/shared/components/input/Input';
import { Done } from '@mui/icons-material';
import { useCallback, useState } from 'react';

export type SignupProps = {
  cancel: () => void;
};

export const Signup: React.FC<SignupProps> = (props) => {
  const { cancel } = props;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Card htmlProps={{ className: 'flex flex-col p-3 w-full' }}>
      <Header
        left={<Button htmlProps={{ onClick: cancel }} icon={<ArrowBack />} />}
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            Sign up
          </div>
        }
      />
      <form className="flex flex-col gap-2 py-2" onSubmit={handleSubmit}>
        <Field label="Email">
          <Input htmlProps={{ type: 'email', value: email }} onChange={setEmail} />
        </Field>
        <Field
          hint="At least 12 characters. Your password will be used to encrypt your database credentials."
          label="Password"
        >
          <Input
            htmlProps={{
              autoComplete: 'new-password',
              minLength: 12,
              type: 'password',
              value: password,
            }}
            onChange={setPassword}
          />
        </Field>
        <Field
          label="Repeat password"
          error={
            repeatPassword && repeatPassword !== password ? "Passwords don't match" : undefined
          }
        >
          <Input
            htmlProps={{ autoComplete: 'new-password', type: 'password', value: repeatPassword }}
            onChange={setRepeatPassword}
          />
        </Field>
        <Button
          htmlProps={{
            disabled: repeatPassword !== password || !email || !password,
            className: 'mt-4',
            type: 'submit',
          }}
          icon={<Done />}
          label="Sign up"
          variant="filled"
        />
      </form>
    </Card>
  );
};
