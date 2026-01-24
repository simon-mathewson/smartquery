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
                'flex cursor-pointer hover:bg-secondaryHighlight hover:bg-secondaryHighlight items-center overflow-hidden !text-textPrimary !justify-start !rounded-xl py-2 text-left',
                {
                  '!min-h-[56px] !gap-4 !pl-4 pr-2': !compact,
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
