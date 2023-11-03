import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';

export const TopBar: React.FC = () => {
  const { connections } = useDefinedContext(GlobalContext);

  return (
    <div
      className="flex h-12 w-full items-center justify-center bg-gray-100 px-2 py-2"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {connections.length > 0 && (
        <div
          className="cursor-pointer border-gray-200 py-0.5 px-2 border-1 grid w-max rounded-lg hover:bg-gray-200 text-sm text-black"
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <div className="leading-snug font-medium text-center">{connections[0].name}</div>
          <div className="text-center text-xs text-gray-500">
            {connections[0].host}:{connections[0].port}
          </div>
        </div>
      )}
    </div>
  );
};
