import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CopilotContext } from '../copilot/Context';
import { Queries } from '../tabs/queries/Queries';
import { CopilotSidebar } from '../copilot/sidebar/Sidebar';
import { Toolbar } from '../toolbar/Toolbar';

export const DatabaseContent: React.FC = () => {
  const copilot = useDefinedContext(CopilotContext);

  return (
    <>
      <Toolbar />
      <div className="flex h-full gap-4 overflow-hidden">
        <Queries />
        {copilot.isOpen && <CopilotSidebar />}
      </div>
    </>
  );
};
