import { useCallback, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { DropdownMenu } from '~/shared/components/dropdownMenu/DropdownMenu';
import { MoreVertOutlined } from '@mui/icons-material';
import { ConnectionsContext } from '../Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { demoConnectionId } from '../demo/constants';
import { assert } from 'ts-essentials';
import { ToastContext } from '~/content/toast/Context';

export const Menu: React.FC = () => {
  const toast = useDefinedContext(ToastContext);
  const { connections, addConnection } = useDefinedContext(ConnectionsContext);

  const connectionsToExport = useMemo(
    () => connections.filter((c) => c.storageLocation === 'local' && c.id !== demoConnectionId),
    [connections],
  );

  const exportConnections = useCallback(() => {
    const exportString = JSON.stringify(connectionsToExport, null, 2);
    const exportBlob = new Blob([exportString], { type: 'application/json' });
    const exportUrl = URL.createObjectURL(exportBlob);
    const exportLink = document.createElement('a');
    exportLink.href = exportUrl;
    exportLink.download = 'connections.json';
    exportLink.click();

    toast.add({
      color: 'success',
      title: `${connectionsToExport.length} connection${
        connectionsToExport.length === 1 ? '' : 's'
      } exported`,
    });
  }, [connectionsToExport, toast]);

  const importConnections = useCallback(() => {
    const importFile = document.createElement('input');
    importFile.type = 'file';
    importFile.accept = '.json';
    importFile.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      const importString = await file?.text();
      assert(importString, 'File empty');

      let successCount = 0;
      let errorCount = 0;

      const importConnections = JSON.parse(importString);
      for (const connection of importConnections) {
        try {
          await addConnection({
            ...connection,
            id: uuid(),
            storageLocation: 'local',
            skipToast: true,
          });
          successCount += 1;
        } catch (error) {
          console.error(error);
          toast.add({
            color: 'danger',
            title: `Failed to import connection ${connection.name}`,
            description: (error as Error).message,
          });
          errorCount += 1;
        }
      }

      toast.add({
        color: successCount > 0 ? 'success' : 'danger',
        title: `${successCount} connection${
          successCount === 1 ? '' : 's'
        } imported, ${errorCount} failed`,
      });
    };
    importFile.click();
  }, [addConnection, toast]);

  return (
    <DropdownMenu
      items={[
        {
          htmlProps: { disabled: !connectionsToExport.length },
          label: 'Export local connections',
          value: 'export',
          onSelect: exportConnections,
        },
        {
          label: 'Import local connections',
          value: 'import',
          onSelect: importConnections,
        },
      ]}
      trigger={{
        element: 'button',
        icon: <MoreVertOutlined />,
      }}
    />
  );
};
