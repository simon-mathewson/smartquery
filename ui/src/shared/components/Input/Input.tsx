import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import { useTheme } from '~/content/theme/useTheme';

export type InputProps = {
  className?: string;
  onChange: (value: string) => void;
  suffix?: ReactNode;
} & Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'autoFocus' | 'placeholder' | 'type' | 'value'
>;

export const Input: React.FC<InputProps> = (props) => {
  const { className, onChange, ...inputProps } = props;

  const { mode } = useTheme();

  return (
    <input
      {...inputProps}
      className={classNames(
        'block h-[36px] w-full rounded-lg border-[1.5px] border-border bg-background p-2 text-sm font-medium leading-none text-textSecondary outline-none focus:border-primary',
        className,
      )}
      onChange={(event) => onChange(event.target.value)}
      style={{ colorScheme: mode }}
    />
  );
};
