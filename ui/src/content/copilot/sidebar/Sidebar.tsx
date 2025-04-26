import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CopilotContext } from '../Context';
import { Card } from '~/shared/components/card/Card';

export const CopilotSidebar: React.FC = () => {
  const copilot = useDefinedContext(CopilotContext);

  return (
    <Card htmlProps={{ className: 'h-full w-[280px] flex-none' }}>
      <div>Copilot</div>
    </Card>
  );
};
