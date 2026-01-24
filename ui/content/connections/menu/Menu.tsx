import { useCallback, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { DropdownMenu } from '~/shared/components/dropdownMenu/DropdownMenu';
import { MoreVertOutlined } from '@mui/icons-material';
import { ConnectionsContext } from '../Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { demoConnectionId } from '../demo/constants';
import { assert } from 'ts-essentials';
import { ToastContext } from '~/content/toast/Context';
import { isReactNative } from '~/content/native/useNative';
import { useNative } from '~/content/native/useNative';
import type { Connection } from '@/connections/types';

export const Menu: React.FC = () => {
  const toast = useDefinedContext(ToastContext);
  const { connections, addConnection } = useDefinedContext(ConnectionsContext);
  const native = useNative();

  const connectionsToExport = useMemo(
    () => connections.filter((c) => c.storageLocation === 'local' && c.id !== demoConnectionId),
    [connections],
  );

  const exportConnections = useCallback(async () => {
    const exportString = JSON.stringify(connectionsToExport, null, 2);

    if (isReactNative) {
      // Use native share method for React Native WebView
      await native.shareFile(exportString, 'connections.json', 'application/json');
    } else {
      // Use blob URL approach for web/Electron
      const exportBlob = new Blob([exportString], { type: 'application/json' });
      const exportUrl = URL.createObjectURL(exportBlob);
      const exportLink = document.createElement('a');
      exportLink.href = exportUrl;
      exportLink.download = 'connections.json';
      exportLink.click();
      URL.revokeObjectURL(exportUrl);
    }

    toast.add({
      color: 'success',
      title: `${connectionsToExport.length} connection${
        connectionsToExport.length === 1 ? '' : 's'
      } exported`,
    });
  }, [connectionsToExport, toast, native]);

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
      let skippedCount = 0;

      const importConnections = JSON.parse(importString) as Connection[];
      for (const connection of importConnections) {
        if (connections.find((c) => c.id === connection.id && c.storageLocation === 'local')) {
          skippedCount += 1;
          continue;
        }

        try {
          await addConnection(
            {
              ...connection,
              id: uuid(),
              storageLocation: 'local',
            },
            { skipToast: true },
          );
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
        } imported, ${errorCount} failed, ${skippedCount} existing skipped`,
      });
    };
    importFile.click();
  }, [addConnection, connections, toast]);

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
