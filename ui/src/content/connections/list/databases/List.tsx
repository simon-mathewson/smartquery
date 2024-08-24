import { List } from '~/shared/components/list/List';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../../Context';

export const DatabaseList: React.FC = () => {
  const { activeConnection, activeConnectionDatabases, connect } =
    useDefinedContext(ConnectionsContext);

  return (
    <div>
      <div className="flex h-[44px] items-center pb-2 pl-1">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-textPrimary">
          Databases
        </div>
      </div>
      <List
        items={activeConnectionDatabases.map((database) => ({
          label: database,
          selectedVariant: 'primary',
          value: database,
        }))}
        onSelect={(database) => {
          if (!activeConnection) return;

          return connect(activeConnection.id, { database });
        }}
        selectedValue={activeConnection?.database ?? null}
      />
    </div>
  );
};
