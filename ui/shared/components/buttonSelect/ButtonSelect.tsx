import classNames from 'classnames';
import type { ButtonButtonProps, ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import type { XOR } from 'ts-essentials';
import { useContext } from 'react';
import { FieldContext } from '../field/FieldContext';

export type ButtonSelectProps<T> = {
  columns?: number;
  fullWidth?: boolean;
  options: Array<{ button: ButtonButtonProps; tooltip?: string; value: T }>;
  rows?: number;
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
    columns = 'auto',
    fullWidth,
    onChange,
    options,
    required,
    rows = 1,
    selectedButton = { color: 'primary' },
    value: selectedValue,
  } = props;

  const fieldContext = useContext(FieldContext);

  return (
    <div
      {...fieldContext?.controlHtmlProps}
      className={classNames('gap-1.5', {
        'grid w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))]': fullWidth,
        'flex flex-wrap': !fullWidth,
      })}
      role="radiogroup"
      style={{
        ...(rows !== 1
          ? { gridTemplateRows: `repeat(${rows}, 1fr)`, gridTemplateColumns: 'initial' }
          : undefined),
        ...(columns !== 'auto'
          ? { gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: 'initial' }
          : undefined),
      }}
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
