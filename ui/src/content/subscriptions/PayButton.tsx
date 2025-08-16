import React, { useState } from 'react';
import { useCheckout } from '@stripe/react-stripe-js';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ToastContext } from '../toast/Context';
import { ArrowForward } from '@mui/icons-material';

export type PayButtonProps = {
  disabled?: boolean;
};

export const PayButton: React.FC<PayButtonProps> = (props) => {
  const { disabled } = props;

  const toast = useDefinedContext(ToastContext);

  const checkout = useCheckout();
  const { confirm, total } = checkout;

  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const result = await confirm();

    if (result.type === 'error') {
      toast.add({
        color: 'danger',
        description: result.error.message,
        title: 'Payment failed',
      });
    }

    setLoading(false);
  };

  return (
    <div>
      <Button
        icon={<ArrowForward />}
        htmlProps={{
          className: 'w-full',
          disabled: loading || disabled,
          onClick: handleClick,
        }}
        label={`Subscribe • ${total.total.amount}/mo.`}
        variant="filled"
      />
    </div>
  );
};

export default PayButton;
