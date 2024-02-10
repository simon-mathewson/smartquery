import { Button } from '../Button/Button';

export type ButtonSelectProps<T> = {
  onChange: (value: T | undefined) => void;
  options: Array<{ label: string; value: T }>;
  value: T | undefined;
};

export function ButtonSelect<T>(props: ButtonSelectProps<T>) {
  const { onChange, options, value: selectedValue } = props;

  return (
    <div className="flex">
      {options.map(({ label, value }, index) => (
        <Button
          key={index}
          label={label}
          onClick={() => onChange(value === selectedValue ? undefined : value)}
          selected={value === selectedValue}
          variant={value === selectedValue ? 'secondary' : 'tertiary'}
        />
      ))}
    </div>
  );
}
