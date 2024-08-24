import { List } from '~/shared/components/list/List';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../../Context';

export const DatabaseList: React.FC = () => {
  const { activeConnection, activeConnectionDatabases, connect } =
    useDefinedContext(ConnectionsContext);

  return (
    <div>
      <h2 className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap py-2 pl-1 text-sm font-medium text-textPrimary">
        Databases
      </h2>
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
