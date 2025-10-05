import React from 'react';
import { Field } from '~/shared/components/field/Field';
import { Input } from '~/shared/components/input/Input';

export const PasswordFields: React.FC<{
  password: string;
  repeatPassword: string;
  setPassword: (password: string) => void;
  setRepeatPassword: (repeatPassword: string) => void;
}> = ({ password, repeatPassword, setPassword, setRepeatPassword }) => {
  return (
    <>
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
        error={repeatPassword && repeatPassword !== password ? "Passwords don't match" : undefined}
      >
        <Input
          htmlProps={{
            autoComplete: 'new-password',
            type: 'password',
            value: repeatPassword,
          }}
          onChange={setRepeatPassword}
        />
      </Field>
    </>
  );
};
