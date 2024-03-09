import classNames from 'classnames';
import type { ButtonProps } from '../Button/Button';
import { Button } from '../Button/Button';

export type ButtonSelectProps<T> = {
  equalWidth?: boolean;
  fullWidth?: boolean;
  onChange: (value: T | undefined) => void;
  options: Array<{ button: ButtonProps; value: T }>;
  selectedButton?: ButtonProps;
  value: T | undefined;
};

export function ButtonSelect<T>(props: ButtonSelectProps<T>) {
  const {
    equalWidth,
    fullWidth,
    onChange,
    options,
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
          className={classNames({ 'grow basis-0': equalWidth })}
          key={index}
          onClick={() => onChange(value === selectedValue ? undefined : value)}
        />
      ))}
    </div>
  );
}
