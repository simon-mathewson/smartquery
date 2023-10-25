import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';

export const TopBar: React.FC = () => {
  const { connections } = useDefinedContext(GlobalContext);

  return (
    <div
      className="flex h-10 w-full items-center justify-center bg-gray-100 px-2 py-2"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {connections.length > 0 && (
        <div
          className="w-max rounded-full bg-gray-200 px-3 py-0.5 text-sm text-gray-900"
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          {connections[0].host}:{connections[0].port}
        </div>
      )}
    </div>
  );
};
