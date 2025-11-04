import { GitHub } from '@mui/icons-material';
import { Button } from '../button/Button';
import classNames from 'classnames';

export type AboutLinksProps = {
  compact?: boolean;
};

export const AboutLinks: React.FC<AboutLinksProps> = (props) => {
  const { compact } = props;

  return (
    <div
      className={classNames('mt-auto flex items-center overflow-hidden', {
        'gap-2': !compact,
      })}
    >
      <Button
        color="secondary"
        element="a"
        htmlProps={{
          className: '[&>svg]:text-textTertiary',
          href: import.meta.env.VITE_GITHUB_URL,
          target: '_blank',
        }}
        icon={<GitHub />}
        tooltip="GitHub"
      />
      <div className="flex flex-col gap-[2px] overflow-hidden pr-1">
        <div className="truncate text-xs text-textTertiary">© 2025 Simon Mathewson</div>
        <div className="flex items-center gap-1 overflow-hidden">
          <a
            href={import.meta.env.VITE_IMPRINT_URL}
            className="truncate text-xs text-textTertiary hover:underline"
            target="_blank"
          >
            Imprint
          </a>
          <div className="text-xs text-textTertiary">&middot;</div>
          <a
            href={import.meta.env.VITE_TERMS_URL}
            className="truncate text-xs text-textTertiary hover:underline"
            target="_blank"
          >
            Terms
          </a>
          <div className="text-xs text-textTertiary">&middot;</div>
          <a
            href={import.meta.env.VITE_PRIVACY_URL}
            className="truncate text-xs text-textTertiary hover:underline"
            target="_blank"
          >
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
};
