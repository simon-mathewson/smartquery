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
        'border-border bg-background text-textSecondary focus:border-primary block h-[36px] w-full rounded-lg border-[1.5px] p-2 text-sm font-medium leading-none outline-none',
        className,
      )}
      onChange={(event) => onChange(event.target.value)}
      style={
        {
          'color-scheme': mode,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }
    />
  );
};
