import classNames from 'classnames';
import { Button } from '../Button/Button';

export type ButtonSelectProps<T> = {
  equalWidth?: boolean;
  fullWidth?: boolean;
  monospace?: boolean;
  onChange: (value: T | undefined) => void;
  options: Array<{ label: string; value: T }>;
  value: T | undefined;
};

export function ButtonSelect<T>(props: ButtonSelectProps<T>) {
  const { equalWidth, fullWidth, monospace, onChange, options, value: selectedValue } = props;

  return (
    <div
      className={classNames('flex gap-2 rounded-lg', {
        'w-full': fullWidth,
      })}
    >
      {options.map(({ label, value }, index) => (
        <Button
          className={classNames({ 'grow basis-0': equalWidth })}
          color={value === selectedValue ? 'primary' : 'secondary'}
          key={index}
          monospace={monospace}
          label={label}
          onClick={() => onChange(value === selectedValue ? undefined : value)}
          variant="selected"
        />
      ))}
    </div>
  );
}
