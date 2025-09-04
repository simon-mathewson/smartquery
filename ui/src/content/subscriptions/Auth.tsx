import { useState } from 'react';
import { Signup } from '../auth/Signup/Signup';
import { Login } from '../auth/Login/Login';

export type AuthProps = {
  onBack: () => void;
  onSuccess: () => void;
};

export const Auth = (props: AuthProps) => {
  const { onBack, onSuccess } = props;

  const [authStage, setAuthStage] = useState<'signup' | 'login'>('signup');

  return (
    <div className="w-full max-w-[356px] space-y-4">
      {authStage === 'signup' ? (
        <Signup onBack={onBack} onSuccess={onSuccess} onShowLogin={() => setAuthStage('login')} />
      ) : (
        <Login onBack={onBack} onSuccess={onSuccess} onShowSignup={() => setAuthStage('signup')} />
      )}
    </div>
  );
};
