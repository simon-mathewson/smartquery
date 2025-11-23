import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  InsertDriveFileOutlined as FileIcon,
} from '@mui/icons-material';
import { Button } from '../button/Button';

type FileHandleSelectProps<T extends { name: string }> = {
  onChange: React.Dispatch<React.SetStateAction<T | null>>;
  value: T | null;
  pickFile: () => Promise<T>;
};

export const FileHandleSelect = <T extends { name: string }>(props: FileHandleSelectProps<T>) => {
  const { onChange, value, pickFile } = props;

  if (!value) {
    return (
      <Button
        htmlProps={{
          className: 'w-full',
          onClick: async () => onChange(await pickFile()),
        }}
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
