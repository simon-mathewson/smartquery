import classNames from 'classnames';
import React from 'react';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';

export type ActionListProps = {
  actions: ButtonProps[];
  compact?: boolean;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
  truncate?: boolean;
};

export const ActionList: React.FC<ActionListProps> = (props) => {
  const { actions, compact, htmlProps, truncate = true } = props;

  return (
    <div
      {...htmlProps}
      className={classNames(
        'flex w-full flex-col gap-3',
        { '!gap-2': compact },
        htmlProps?.className,
      )}
    >
      {actions.map((action) => (
        <React.Fragment key={action.label}>
          <Button
            {...action}
            align="left"
            htmlProps={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(action.htmlProps as any),
              className: classNames(
                'flex !min-h-[56px] cursor-pointer items-center gap-4 overflow-hidden focus:!bg-card hover:!bg-card focus:!bg-background !text-textPrimary !justify-start !rounded-2xl border border-border bg-card !pl-4 pr-2 py-2 text-left shadow-2xl hover:border-borderHover',
                {
                  '!min-h-[32px] !gap-2 !px-2 !text-xs': compact,
                },
              ),
            }}
            truncate={truncate}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
