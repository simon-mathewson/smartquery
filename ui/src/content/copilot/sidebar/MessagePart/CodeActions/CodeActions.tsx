import { ContentCopyOutlined } from '@mui/icons-material';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { ToastContext } from '~/content/toast/Context';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import Play from '~/shared/icons/Play.svg?react';
import Add from '~/shared/icons/Add.svg?react';
export const CodeActions: React.FC<{ code: string }> = ({ code }) => {
  const toast = useDefinedContext(ToastContext);

  const { addQuery } = useDefinedContext(QueriesContext);

  return (
    <div className="flex justify-end gap-2 pr-2 pt-2">
      <Button
        color="secondary"
        htmlProps={{
          onClick: () => {
            addQuery(
              {
                initialInputMode: 'editor',
                sql: code,
              },
              { afterActiveTab: true },
            );
          },
        }}
        icon={<Play />}
        size="small"
      />
      <Button
        color="secondary"
        htmlProps={{
          onClick: () => {
            addQuery(
              {
                initialInputMode: 'editor',
                sql: code,
              },
              { afterActiveTab: true, skipRun: true },
            );
          },
        }}
        icon={<Add />}
        size="small"
      />
      <Button
        color="secondary"
        htmlProps={{
          onClick: () => {
            navigator.clipboard.writeText(code);
            toast.add({
              title: 'Copied to clipboard',
              color: 'success',
            });
          },
        }}
        icon={<ContentCopyOutlined />}
        size="small"
      />
    </div>
  );
};
