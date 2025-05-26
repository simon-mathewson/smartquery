import { ArrowBack } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { Input } from '~/shared/components/input/Input';
import { Done } from '@mui/icons-material';

export type SignupProps = {
  exit: () => void;
};

export const Signup: React.FC<SignupProps> = (props) => {
  const { exit } = props;

  return (
    <Card htmlProps={{ className: 'flex flex-col p-3 w-full' }}>
      <Header
        left={<Button htmlProps={{ onClick: exit }} icon={<ArrowBack />} />}
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            Sign up
          </div>
        }
      />
      <form className="flex flex-col gap-2 py-2">
        <Field label="Email">
          <Input htmlProps={{ type: 'email' }} />
        </Field>
        <Field
          hint="At least 12 characters. Your password will be used to encrypt your database credentials."
          label="Password"
        >
          <Input htmlProps={{ autoComplete: 'new-password', minLength: 12, type: 'password' }} />
        </Field>
        <Field label="Repeat password">
          <Input htmlProps={{ autoComplete: 'new-password', type: 'password' }} />
        </Field>
        <Button
          htmlProps={{ className: 'mt-4', type: 'submit' }}
          icon={<Done />}
          label="Sign up"
          variant="filled"
        />
      </form>
    </Card>
  );
};
