import {
  AutoAwesomeOutlined,
  ExpandMoreOutlined,
  FormatListBulletedOutlined,
  HomeOutlined,
  SettingsOutlined,
  TableChartOutlined,
} from '@mui/icons-material';
import classNames from 'classnames';
import { useRoute } from 'wouter';
import { Copilot } from '~/content/ai/copilot/sidebar/Copilot';
import { Connections } from '~/content/connections/Connections';
import { ConnectionsContext } from '~/content/connections/Context';
import { isElectron, isReactNative } from '~/content/native/useNative';
import { Settings } from '~/content/settings/Settings';
import { routes } from '~/router/routes';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { MOBILE_NAVIGATION_HEIGHT } from './constants';
import { QueriesPage } from './QueriesPage/QueriesPage';
import { MobileNavigationContext } from './Context';

export const MobileNavigation: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [isConnectionRoute] = useRoute(routes.connection({ database: '', schema: '' }));
  const [isDatabaseRoute] = useRoute(routes.connection({ schema: '' }));
  const [isSchemaRoute] = useRoute(routes.connection());
  const isAnyConnectionRoute = isConnectionRoute || isDatabaseRoute || isSchemaRoute;

  const isMobile = useIsMobile();

  const { overlayPage, setOverlayPage } = useDefinedContext(MobileNavigationContext);

  if (!isMobile) return null;

  const menuItems = [
    ...(activeConnection
      ? [
          {
            active: overlayPage === 'queries',
            icon: <FormatListBulletedOutlined />,
            label: 'Queries',
            onClick: () => setOverlayPage('queries'),
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
      <div className="shrink-0" style={{ height: `${MOBILE_NAVIGATION_HEIGHT}px` }} />
      <div
        className={classNames(
          'pointer-events-none fixed left-0 right-0 top-0 z-40 h-[100dvh] w-full',
          {
            '!pointer-events-auto bg-card/80 backdrop-blur-xl': overlayPage,
          },
        )}
      >
        <div
          className={classNames('h-full grow overflow-y-auto p-2', {
            'pt-8': isElectron,
          })}
          style={{ paddingBottom: `${MOBILE_NAVIGATION_HEIGHT}px` }}
        >
          {overlayPage === 'connections' && <Connections />}
          {overlayPage === 'queries' && <QueriesPage onSelect={() => setOverlayPage(null)} />}
          {overlayPage === 'copilot' && <Copilot onCloseCopilot={() => setOverlayPage(null)} />}
          {overlayPage === 'settings' && <Settings close={() => setOverlayPage(null)} />}
        </div>
        <div
          className={classNames(
            'pointer-events-auto sticky bottom-0 flex shrink-0 items-center justify-center gap-2 px-2 pb-2',
            { 'px-5 pb-5': isReactNative },
          )}
        >
          {activeConnection && (
            <div className="flex h-[56px] min-w-[33%] grow items-center rounded-full border border-border bg-background/60 shadow-2xl backdrop-blur-xl focus-within:outline focus-within:outline-primary">
              <button
                className="flex w-full cursor-pointer select-none items-center gap-[2px] overflow-hidden py-2 pl-4 pr-2 text-left text-sm focus:!outline-none"
                onClick={() => setOverlayPage('connections')}
              >
                <div className="flex grow flex-col gap-1 overflow-hidden">
                  <div className="truncate text-sm font-medium leading-tight text-textPrimary">
                    {activeConnection.name}
                  </div>
                  <div className="truncate text-xs font-medium leading-none text-textTertiary">
                    {activeConnection.database}
                    {activeConnection.engine === 'postgres' && ` ⁠– ${activeConnection.schema}`}
                  </div>
                </div>
                <ExpandMoreOutlined className="text-textTertiary" />
              </button>
            </div>
          )}
          <div
            className="grid w-max max-w-full grid-rows-1 items-center rounded-full border border-border bg-background/60 p-1 shadow-2xl backdrop-blur-xl"
            style={{ gridTemplateColumns: `repeat(${menuItems.length}, minmax(50px, 80px))` }}
          >
            {menuItems.map(({ active, icon, label, onClick }) => (
              <button
                className={classNames(
                  'flex flex-col items-center gap-[4px] rounded-3xl pb-[4px] pt-[2px] text-primary [&>svg]:h-[26px] [&>svg]:w-[26px]',
                  {
                    'bg-secondaryHighlight': active,
                  },
                )}
                key={label}
                onClick={onClick}
              >
                {icon}
                <div className="text-[10px] font-medium leading-none text-textPrimary">{label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
