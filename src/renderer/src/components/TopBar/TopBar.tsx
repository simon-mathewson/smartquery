import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';

export const TopBar: React.FC = () => {
  const { connections } = useDefinedContext(GlobalContext);

  return (
    <div
      className="flex h-12 w-full items-center justify-center px-2 py-2"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {connections.length > 0 && (
        <div
          className="border-1 grid w-max cursor-pointer rounded-lg border-gray-200 px-2 py-0.5 text-sm text-black hover:bg-gray-300"
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <div className="text-center font-medium leading-snug">{connections[0].name}</div>
          <div className="text-center text-xs text-gray-500">
            {connections[0].host}:{connections[0].port}
          </div>
        </div>
      )}
    </div>
  );
};
