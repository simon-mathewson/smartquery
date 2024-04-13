import classNames from 'classnames';
import type { ButtonProps } from '../Button/Button';
import { Button } from '../Button/Button';
import type { XOR } from 'ts-essentials';

export type ButtonSelectProps<T> = {
  equalWidth?: boolean;
  fullWidth?: boolean;
  options: Array<{ button: ButtonProps; value: T }>;
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

  return (
    <div
      className={classNames('flex gap-2 rounded-lg', {
        'w-full': fullWidth,
      })}
    >
      {options.map(({ button, value }, index) => (
        <Button
          color="secondary"
          variant="highlighted"
          {...button}
          {...(value === selectedValue ? selectedButton : {})}
          className={classNames({ 'grow basis-0': equalWidth, 'w-full': fullWidth })}
          key={index}
          onClick={() => {
            if (required) {
              onChange(value);
              return;
            }
            onChange(value === selectedValue ? undefined : value);
          }}
        />
      ))}
    </div>
  );
}
