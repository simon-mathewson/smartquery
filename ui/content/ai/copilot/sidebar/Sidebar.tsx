import classNames from 'classnames';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { Card } from '~/shared/components/card/Card';
import { ResizeHandle } from '~/shared/components/resizeHandle/ResizeHandle';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { CopilotSidebarContext } from './Context';
import { Copilot } from './Copilot';
import { useContext } from 'react';

export const CopilotSidebar: React.FC = () => {
  const { activeConnection } = useContext(ActiveConnectionContext) ?? {};
  const { isOpen } = useDefinedContext(CopilotSidebarContext);

  const [desktopWidth, setDesktopWidth] = useStoredState('CopilotSidebar.width', 328);

  if (!activeConnection) return null;

  return (
    <div
      tabIndex={isOpen ? undefined : -1}
      className={classNames(
        'absolute right-0 z-50 h-screen bg-background p-3 sm:relative sm:right-0 sm:pl-1',
        {
          hidden: !isOpen,
        },
      )}
      style={{ width: `${desktopWidth}px` }}
    >
      {isOpen && (
        <ResizeHandle
          offset={13}
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
