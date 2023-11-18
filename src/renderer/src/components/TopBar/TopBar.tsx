import { Add } from '@mui/icons-material';
import { Button } from '../shared/Button/Button';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { uniqueId } from 'lodash';

export const TopBar: React.FC = () => {
  const { setQueries } = useDefinedContext(GlobalContext);

  return (
    <div className="window-drag-area absolute left-[224px] top-0 z-10 w-[calc(100%_-_224px)] border-b border-b-gray-200 bg-gray-50/80 p-2 backdrop-blur-lg">
      <Button
        align="left"
        icon={<Add />}
        label="Query"
        onClick={() => setQueries([[{ id: uniqueId(), showEditor: true }]])}
      />
    </div>
  );
};
