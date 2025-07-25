import React, { useContext } from 'react';
import colors from 'tailwindcss/colors';
import { FieldContext } from '../field/FieldContext';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ThemeContext } from '~/content/theme/Context';
import classNames from 'classnames';
import { primaryColors } from '~/content/theme/primaryColors';
import { Tooltip } from '../tooltip/Tooltip';

export type ThemeColorSelectProps = {
  value: keyof typeof colors;
  onChange: (value: keyof typeof colors) => void;
};

export const ThemeColorSelect: React.FC<ThemeColorSelectProps> = ({ value, onChange }) => {
  const { mode } = useDefinedContext(ThemeContext);
  const fieldContext = useContext(FieldContext);

  return (
    <div
      aria-required="true"
      className="flex w-full justify-between px-1 py-2"
      role="radiogroup"
      {...fieldContext?.controlHtmlProps}
    >
      {primaryColors.map((option) => {
        const colorValue = colors[option][mode === 'dark' ? 500 : 600];

        return (
          <Tooltip<HTMLDivElement> key={option} text={option}>
            {(tooltipProps) => (
              <div
                {...tooltipProps.htmlProps}
                aria-checked={value === option}
                aria-label={option}
                className={classNames(
                  'flex h-6 w-6 cursor-pointer items-center justify-center rounded-full !outline-offset-2 transition-all hover:scale-125',
                )}
                onClick={() => onChange(option)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    onChange(option);
                  }
                }}
                role="radio"
                style={{
                  backgroundColor: colorValue,
                  boxShadow: `0 0 0 2px ${colorValue}A1`,
                }}
                tabIndex={0}
              >
                {value === option && (
                  <div className="h-3 w-3 rounded-full bg-white shadow-[inset_0_0_0_2px_rgba(0,0,0,0.05)]" />
                )}
              </div>
            )}
          </Tooltip>
        );
      })}
    </div>
  );
};
