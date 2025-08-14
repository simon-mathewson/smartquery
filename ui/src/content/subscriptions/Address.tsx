import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { AddressElement, Elements } from '@stripe/react-stripe-js';
import { useCallback, useState } from 'react';
import { ThemeContext } from '~/content/theme/Context';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Header } from '~/shared/components/header/Header';
import { Loading } from '~/shared/components/loading/Loading';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Address as AddressType } from '@/payments/types';
import { assert } from 'ts-essentials';
import { stripe } from './stripe';

export type AddressProps = {
  goBack: () => void;
  onContinue: (address: AddressType) => void;
  value: AddressType | null;
};

export const Address: React.FC<AddressProps> = (props) => {
  const { goBack, onContinue, value } = props;

  const theme = useDefinedContext(ThemeContext);

  const [isLoading, setIsLoading] = useState(true);

  const [state, setState] = useState<{
    value: AddressType | null;
    complete: boolean;
  }>({
    value,
    complete: value !== null,
  });

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      assert(state?.complete, 'Complete address is required');
      assert(state.value, 'Address is required');

      onContinue(state.value);
    },
    [state, onContinue],
  );

  return (
    <Card htmlProps={{ className: 'container max-w-[400px]' }}>
      <Header
        left={<Button htmlProps={{ onClick: goBack }} icon={<ArrowBack />} />}
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            Address
          </div>
        }
      />
      <form className="relative flex min-h-[200px] flex-col gap-4 p-2" onSubmit={onSubmit}>
        {isLoading && <Loading />}
        <Elements
          stripe={stripe}
          options={{ appearance: { theme: theme.mode === 'dark' ? 'night' : 'stripe' } }}
        >
          <AddressElement
            onReady={() => setIsLoading(false)}
            options={{
              autocomplete: {
                mode: 'google_maps_api',
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
              },
              mode: 'billing',
              defaultValues: state.value ?? undefined,
            }}
            onChange={setState}
          />
        </Elements>
        <Button
          icon={<ArrowForward />}
          htmlProps={{ disabled: !state?.complete, type: 'submit' }}
          label="Continue"
          variant="filled"
        />
      </form>
    </Card>
  );
};
