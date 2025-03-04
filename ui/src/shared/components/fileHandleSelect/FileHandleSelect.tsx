import { Button } from '../button/Button';
import { Add as AddIcon } from '@mui/icons-material';
import { InsertDriveFileOutlined as FileIcon } from '@mui/icons-material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { ToastContext } from '~/content/toast/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { requestFileHandlePermission } from '~/shared/utils/fileHandles/fileHandles';

type FileHandleSelectProps = {
  onChange: React.Dispatch<React.SetStateAction<FileSystemFileHandle | null>>;
  options: Parameters<typeof window.showOpenFilePicker>[0];
  value: FileSystemFileHandle | null;
};

export const FileHandleSelect: React.FC<FileHandleSelectProps> = (props) => {
  const { onChange, options, value } = props;

  const toast = useDefinedContext(ToastContext);

  const selectFile = async () => {
    const [handle] = await window.showOpenFilePicker(options);
    onChange(handle);

    await requestFileHandlePermission(handle, toast);
  };

  if (!value) {
    return (
      <Button
        htmlProps={{ className: 'w-full', onClick: selectFile }}
        icon={<AddIcon />}
        label="Choose file"
      />
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <FileIcon className="!text-[20px] text-textTertiary" />
      <div className="flex-1 text-ellipsis text-sm font-medium text-textSecondary">
        {value.name}
      </div>
      <Button color="danger" htmlProps={{ onClick: () => onChange(null) }} icon={<DeleteIcon />} />
    </div>
  );
};
