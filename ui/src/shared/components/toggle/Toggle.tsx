import classNames from 'classnames';
import { useCallback, useContext, useState } from 'react';
import { FieldContext } from '../field/FieldContext';
import { v4 as uuid } from 'uuid';

export type ToggleProps = {
  disabled?: boolean;
  hint?: string;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
};

export const Toggle: React.FC<ToggleProps> = (props) => {
  const { disabled, hint, label, onChange: onChangeProp, value } = props;

  const fieldContext = useContext(FieldContext);

  const [labelId] = useState(uuid());
  const [hintId] = useState(uuid());

  const onChange = useCallback(
    (value: boolean) => {
      if (disabled) return;
      onChangeProp(value);
    },
    [disabled, onChangeProp],
  );

  return (
    <div
      {...fieldContext?.controlHtmlProps}
      aria-checked={value}
      aria-disabled={disabled}
      aria-labelledby={fieldContext?.controlHtmlProps['aria-labelledby'] ?? labelId}
      aria-describedby={fieldContext?.controlHtmlProps['aria-describedby'] ?? hintId}
      className={classNames('flex w-full cursor-pointer items-center gap-3 rounded-lg py-2', {
        '!cursor-default opacity-50': disabled,
      })}
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
          'relative flex h-5 w-10 flex-shrink-0 rounded-full bg-background shadow-[inset_0_0_0_1px_theme(colors.border)] transition-all ease-linear',
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
