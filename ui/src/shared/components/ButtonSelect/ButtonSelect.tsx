import { Button } from '../Button/Button';

export type ButtonSelectProps<T> = {
  monospace?: boolean;
  onChange: (value: T | undefined) => void;
  options: Array<{ label: string; value: T }>;
  value: T | undefined;
};

export function ButtonSelect<T>(props: ButtonSelectProps<T>) {
  const { monospace, onChange, options, value: selectedValue } = props;

  return (
    <div className="flex">
      {options.map(({ label, value }, index) => (
        <Button
          key={index}
          monospace={monospace}
          label={label}
          onClick={() => onChange(value === selectedValue ? undefined : value)}
          selected={value === selectedValue}
          variant={value === selectedValue ? 'secondary' : 'tertiary'}
        />
      ))}
    </div>
  );
}
