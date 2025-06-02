import classNames from 'classnames';
import type { ButtonButtonProps, ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import type { XOR } from 'ts-essentials';
import { useContext } from 'react';
import { FieldContext } from '../field/FieldContext';

export type ButtonSelectProps<T> = {
  equalWidth?: boolean;
  fullWidth?: boolean;
  options: Array<{ button: ButtonButtonProps; value: T }>;
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
    equalWidth,
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
      className={classNames('flex gap-2 rounded-lg', {
        'w-full': fullWidth,
      })}
      role="radiogroup"
    >
      {options.map(({ button, value }, index) => (
        <Button
          color="secondary"
          variant="highlighted"
          {...button}
          {...(value === selectedValue ? selectedButton : {})}
          element="button"
          htmlProps={{
            ...button.htmlProps,
            'aria-checked': value === selectedValue,
            className: classNames({ 'grow basis-0': equalWidth, 'w-full': fullWidth }),
            onClick: () => {
              if (required) {
                onChange(value);
                return;
              }
              onChange(value === selectedValue ? undefined : value);
            },
            role: 'radio',
          }}
          key={index}
        />
      ))}
    </div>
  );
}
