import { ArrowBack, Done } from '@mui/icons-material';
import { useCallback, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import type { CaptchaModalInput } from '~/shared/components/captcha/Modal';
import { CaptchaModal } from '~/shared/components/captcha/Modal';
import { Field } from '~/shared/components/field/Field';
import { Input } from '~/shared/components/input/Input';
import { useModal } from '~/shared/components/modal/useModal';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../Context';
import { PasswordFields } from '../PasswordFields';
import { Card } from '~/shared/components/card/Card';
import { Header } from '~/shared/components/header/Header';
import { routes } from '~/router/routes';

export type SignupProps = {
  onSuccess: () => void;
};

export const Signup: React.FC<SignupProps> = ({ onSuccess }) => {
  const auth = useDefinedContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const captchaModal = useModal<CaptchaModalInput>();

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      captchaModal.open({
        onSuccess: async () => {
          captchaModal.close();
          await auth.signUp(email, password);
          onSuccess();
        },
      });
    },
    [auth, captchaModal, email, onSuccess, password],
  );

  return (
    <>
      <CaptchaModal modalControl={captchaModal} />
      <Card htmlProps={{ className: 'flex flex-col p-3 w-full max-w-[356px]' }}>
        <Header
          left={<Button element="link" htmlProps={{ href: routes.root() }} icon={<ArrowBack />} />}
          middle={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
              Sign up
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
          <PasswordFields
            password={password}
            repeatPassword={repeatPassword}
            setPassword={setPassword}
            setRepeatPassword={setRepeatPassword}
          />
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
    </>
  );
};
