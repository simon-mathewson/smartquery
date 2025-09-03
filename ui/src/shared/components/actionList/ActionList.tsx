import type { SvgIconComponent } from '@mui/icons-material';
import { Link } from 'wouter';

export type Action = {
  hint?: string;
  label: string;
  icon: SvgIconComponent | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  route?: string;
  onClick?: () => void;
};

export type ActionListProps = {
  actions: Action[];
};

export const ActionList: React.FC<ActionListProps> = (props) => {
  const { actions } = props;

  return (
    <div className="flex w-full flex-col gap-3">
      {actions.map((action) => {
        const Element = action.route ? Link : 'button';

        return (
          <Element
            className="flex h-14 cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-border bg-card px-4 hover:border-borderHover"
            key={action.label}
            onClick={action.onClick}
            href={action.route as string}
            tabIndex={0}
          >
            <action.icon className="!h-7 !w-7 text-primary" />
            <div className="flex flex-col items-start gap-[2px]">
              <div className="text-sm font-medium text-textPrimary">{action.label}</div>
              <div className="text-xs text-textTertiary">{action.hint}</div>
            </div>
          </Element>
        );
      })}
    </div>
  );
};
