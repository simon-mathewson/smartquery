import type { SvgIconComponent } from '@mui/icons-material';
import classNames from 'classnames';
import { Link } from 'wouter';

export type Action = {
  disabled?: boolean;
  hint?: string;
  icon: SvgIconComponent | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick?: () => void;
  route?: string;
};

export type ActionListProps = {
  actions: Action[];
  compact?: boolean;
};

export const ActionList: React.FC<ActionListProps> = (props) => {
  const { actions, compact } = props;

  return (
    <div className={classNames('flex w-full flex-col gap-3', { '!gap-2': compact })}>
      {actions.map((action) => {
        const Element = action.route ? Link : 'button';

        return (
          <Element
            {...(Element === 'button'
              ? { disabled: action.disabled }
              : { 'aria-disabled': action.disabled })}
            className={classNames(
              'flex min-h-[56px] cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-border bg-card px-4 py-2 text-left hover:border-borderHover',
              {
                '!min-h-[40px] !gap-2 !px-2': compact,
                'pointer-events-none opacity-50': action.disabled,
              },
            )}
            key={action.label}
            onClick={action.onClick}
            href={action.route as string}
            tabIndex={0}
          >
            <action.icon
              className={classNames('text-primary', {
                '!h-7 !w-7': !compact,
                '!h-5 !w-5': compact,
              })}
            />
            <div className="flex flex-col items-start gap-[2px]">
              <div
                className={classNames('text-sm font-medium text-textPrimary', {
                  '!text-xs': compact,
                })}
              >
                {action.label}
              </div>
              {action.hint && <div className="text-xs text-textTertiary">{action.hint}</div>}
            </div>
          </Element>
        );
      })}
    </div>
  );
};
