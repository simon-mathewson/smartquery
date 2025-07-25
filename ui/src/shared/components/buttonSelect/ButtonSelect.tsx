import classNames from 'classnames';
import type { ButtonButtonProps, ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import type { XOR } from 'ts-essentials';
import { useContext } from 'react';
import { FieldContext } from '../field/FieldContext';

export type ButtonSelectProps<T> = {
  fullWidth?: boolean;
  options: Array<{ button: ButtonButtonProps; tooltip?: string; value: T }>;
  selectedButton?: ButtonProps;
} & XOR<
  {
    onChange: (value: T | undefined) => void;
    value: T | undefined;
  },
  {
    onChange: (value: T) => void;
    required: true;
    value: T;
  }
>;

export function ButtonSelect<T>(props: ButtonSelectProps<T>) {
  const {
    fullWidth,
    onChange,
    options,
    required,
    selectedButton = { color: 'primary' },
    value: selectedValue,
  } = props;

  const fieldContext = useContext(FieldContext);

  return (
    <div
      {...fieldContext?.controlHtmlProps}
      className={classNames('gap-2 rounded-lg', {
        'grid w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))]': fullWidth,
        'flex flex-wrap': !fullWidth,
      })}
      role="radiogroup"
    >
      {options.map(({ button, tooltip, value }, index) => (
        <Button
          color="secondary"
          key={index}
          tooltip={tooltip}
          variant="highlighted"
          {...button}
          {...(value === selectedValue ? selectedButton : {})}
          element="button"
          htmlProps={{
            ...button.htmlProps,
            'aria-checked': value === selectedValue,
            className: classNames({ 'w-full': fullWidth }),
            onClick: () => {
              if (required) {
                onChange(value);
                return;
              }
              onChange(value === selectedValue ? undefined : value);
            },
            role: 'radio',
          }}
        />
      ))}
    </div>
  );
}
