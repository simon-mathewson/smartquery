import type { Distributable } from '@/desktop/distributables';
import { FileDownloadOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';

export type DistributableLinkProps = {
  distributable: Distributable;
  highlight?: boolean;
};

export const DistributableLink: React.FC<DistributableLinkProps> = ({
  distributable,
  highlight = false,
}) => {
  if (distributable.os === 'ios') {
    return (
      <a
        href="https://apps.apple.com/us/app/smartquery/id6755796701?itscg=30200&itsct=apps_box_badge&mttnsubad=6755796701"
        className="mx-auto block cursor-pointer select-none"
      >
        <img
          src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1765843200"
          alt="Download on the App Store"
          className="h-[48px] w-[144px] object-contain"
        />
      </a>
    );
  }

  return (
    <Button
      element="a"
      icon={<FileDownloadOutlined />}
      htmlProps={{
        href: distributable.url,
      }}
      label={highlight ? `Install ${distributable.label}` : distributable.label}
      variant={highlight ? 'filled' : 'default'}
    />
  );
};
