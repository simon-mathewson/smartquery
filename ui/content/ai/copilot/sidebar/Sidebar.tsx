import classNames from 'classnames';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { Card } from '~/shared/components/card/Card';
import { ResizeHandle } from '~/shared/components/resizeHandle/ResizeHandle';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { CopilotSidebarContext } from './Context';
import { Copilot } from './Copilot';
import { useContext } from 'react';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';

export const CopilotSidebar: React.FC = () => {
  const isMobile = useIsMobile();
  const { activeConnection } = useContext(ActiveConnectionContext) ?? {};
  const { isOpen } = useDefinedContext(CopilotSidebarContext);

  const [desktopWidth, setDesktopWidth] = useStoredState('CopilotSidebar.width', 400);

  if (!activeConnection || isMobile) return null;

  return (
    <div
      tabIndex={isOpen ? undefined : -1}
      className={classNames(
        'absolute right-0 z-50 h-[100dvh] bg-background p-2 pl-0 sm:relative sm:right-0',
        {
          hidden: !isOpen,
        },
      )}
      style={{ width: `${desktopWidth}px` }}
    >
      {isOpen && (
        <ResizeHandle
          offset={9}
          position="left"
          onResize={setDesktopWidth}
          minWidth={200}
          maxWidth={600}
        />
      )}
      <Card htmlProps={{ className: 'h-full' }}>
        <Copilot showClose />
      </Card>
    </div>
  );
};
