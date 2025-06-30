import classNames from 'classnames';
import { useContext, useState } from 'react';
import { FieldContext } from '../field/FieldContext';
import { v4 as uuid } from 'uuid';

export type ToggleProps = {
  hint?: string;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
};

export const Toggle: React.FC<ToggleProps> = (props) => {
  const { hint, label, onChange, value } = props;

  const fieldContext = useContext(FieldContext);

  const [labelId] = useState(uuid());
  const [hintId] = useState(uuid());

  return (
    <div
      {...fieldContext?.controlHtmlProps}
      aria-checked={value}
      aria-labelledby={fieldContext?.controlHtmlProps['aria-labelledby'] ?? labelId}
      aria-describedby={fieldContext?.controlHtmlProps['aria-describedby'] ?? hintId}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg py-2"
      onClick={() => onChange(!value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onChange(!value);
        }
      }}
      role="checkbox"
      tabIndex={0}
    >
      <div
        className={classNames(
          'relative flex h-5 w-10 rounded-full bg-background shadow-[inset_0_0_0_1px_theme(colors.border)] transition-all ease-linear',
          {
            'bg-primary': value,
          },
        )}
      >
        <div
          className={classNames(
            'absolute left-0 top-0 h-full w-5 rounded-full border-[1px] border-border bg-white shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-all ease-out',
            {
              'left-5 shadow-[0_0_8px_rgba(0,0,0,0.2)]': value,
            },
          )}
        />
      </div>
      <div className="flex flex-col gap-0">
        <div className="text-sm font-medium text-textSecondary" id={labelId}>
          {label}
        </div>
        {hint && (
          <div className="text-xs text-textTertiary" id={hintId}>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
};
