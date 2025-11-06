import {
  AutoAwesomeOutlined,
  ExpandMoreOutlined,
  FormatListBulletedOutlined,
  HomeOutlined,
  SettingsOutlined,
  TableChartOutlined,
} from '@mui/icons-material';
import classNames from 'classnames';
import { useState } from 'react';
import { useRoute } from 'wouter';
import { Copilot } from '~/content/ai/copilot/sidebar/Copilot';
import { Connections } from '~/content/connections/Connections';
import { ConnectionsContext } from '~/content/connections/Context';
import { Settings } from '~/content/settings/Settings';
import { routes } from '~/router/routes';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { TableList } from '../sidebar/tableList/TableList';

export const MobileNavigation: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [isConnectionRoute] = useRoute(routes.connection({ database: '', schema: '' }));
  const [isDatabaseRoute] = useRoute(routes.connection({ schema: '' }));
  const [isSchemaRoute] = useRoute(routes.connection());
  const isAnyConnectionRoute = isConnectionRoute || isDatabaseRoute || isSchemaRoute;

  const isMobile = useIsMobile();

  const connectionsOverlay = useOverlay({
    align: 'left',
    darkenBackground: true,
  });

  const [overlayPage, setOverlayPage] = useState<'tables' | 'settings' | 'copilot' | null>(null);

  if (!isMobile) return null;

  const menuItems = [
    ...(activeConnection
      ? [
          {
            active: overlayPage === 'tables',
            icon: <FormatListBulletedOutlined />,
            label: 'Tables',
            onClick: () => setOverlayPage('tables'),
          },
          {
            active: isAnyConnectionRoute && !overlayPage,
            icon: <TableChartOutlined />,
            label: 'Data',
            onClick: () => setOverlayPage(null),
          },
          {
            active: overlayPage === 'copilot',
            icon: <AutoAwesomeOutlined />,
            label: 'Copilot',
            onClick: () => setOverlayPage('copilot'),
          },
        ]
      : [
          {
            active: !overlayPage,
            icon: <HomeOutlined />,
            label: 'Home',
            onClick: () => setOverlayPage(null),
          },
        ]),
    {
      active: overlayPage === 'settings',
      icon: <SettingsOutlined />,
      label: 'Settings',
      onClick: () => setOverlayPage('settings'),
    },
  ];

  return (
    <>
      <div className="h-[64px] shrink-0" />
      <div
        className={classNames('h-dvh pointer-events-none fixed left-0 right-0 top-0 z-40 w-full', {
          '!pointer-events-auto bg-background/60 backdrop-blur-xl': overlayPage,
        })}
      >
        <div className="h-full grow overflow-y-auto pb-[72px]">
          {overlayPage === 'tables' && <TableList onSelect={() => setOverlayPage(null)} />}
          {overlayPage === 'copilot' && <Copilot onCloseCopilot={() => setOverlayPage(null)} />}
          {overlayPage === 'settings' && <Settings close={() => setOverlayPage(null)} />}
        </div>
        <div className="pointer-events-auto sticky bottom-0 flex shrink-0 items-center justify-center gap-2 px-2 pb-2">
          {activeConnection && (
            <div className="flex min-w-[33%] grow items-center rounded-3xl border border-border bg-background/60 shadow-2xl backdrop-blur-xl focus-within:outline focus-within:outline-primary">
              <button
                className="flex w-full cursor-pointer select-none items-center gap-[2px] overflow-hidden rounded-lg py-2 pl-4 pr-2 text-left text-sm focus:!outline-none"
                {...connectionsOverlay.triggerProps}
              >
                <div className="flex grow flex-col gap-1 overflow-hidden">
                  <div className="truncate text-xs font-medium leading-tight text-textPrimary">
                    {activeConnection.name}
                  </div>
                  <div className="truncate text-[11px] font-medium leading-none text-textTertiary">
                    {activeConnection.database}
                    {activeConnection.engine === 'postgres' && ` ⁠– ${activeConnection.schema}`}
                  </div>
                </div>
                <ExpandMoreOutlined className="text-textTertiary" />
              </button>
              <OverlayCard
                htmlProps={{ className: 'w-max p-2 shadow-2xl' }}
                overlay={connectionsOverlay}
              >
                {() => <Connections onSelect={() => connectionsOverlay.close()} />}
              </OverlayCard>
            </div>
          )}
          <div
            className="grid w-max max-w-full grid-rows-1 items-center rounded-3xl border border-border bg-background/60 p-1 shadow-2xl backdrop-blur-xl"
            style={{ gridTemplateColumns: `repeat(${menuItems.length}, minmax(50px, 80px))` }}
          >
            {menuItems.map(({ active, icon, label, onClick }) => (
              <button
                className={classNames(
                  'flex flex-col items-center gap-[2px] rounded-3xl pb-[3px] pt-[1px] text-primary [&>svg]:h-[22px] [&>svg]:w-[22px]',
                  {
                    'bg-secondaryHighlight': active,
                  },
                )}
                key={label}
                onClick={onClick}
              >
                {icon}
                <div className="text-[11px] font-medium leading-none text-textPrimary">{label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
