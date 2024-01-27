import { EditOutlined } from '@mui/icons-material';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { Query } from '~/content/queries/types';
import { Input } from '~/shared/components/Input/Input';
import { useClickOutside } from '~/shared/hooks/useClickOutside';

export type EditModalProps = {
  query: Query;
  selection: number[][];
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditModal = forwardRef<HTMLDivElement, EditModalProps>((props, ref) => {
  const { query, selection, setIsEditing } = props;

  const { initialValues, selectedColumns } = useMemo(() => {
    const selectedRowIndex = selection.findIndex((row) => row);
    if (selectedRowIndex === -1) return {};

    const selectedColumnIndices = selection[selectedRowIndex];
    const selectedRow = query.rows[selectedRowIndex];
    const selectedColumns = query.columns.filter(
      (_, index) => selectedColumnIndices.length === 0 || selectedColumnIndices.includes(index),
    );

    const initialValues = selectedColumns.reduce(
      (acc, column) => ({ ...acc, [column]: selectedRow[column] }),
      {},
    );

    return { initialValues, selectedColumns };
  }, [query, selection]);

  const [formValues, setFormValues] = useState<{ [key: string]: string }>(initialValues ?? {});

  useEffect(() => {
    setFormValues(initialValues ?? {});
  }, [initialValues]);

  const localRef = useRef<HTMLDivElement | null>(null);

  useClickOutside({
    handler: () => {
      setIsEditing(false);
    },
    refs: [localRef],
  });

  if (selection.length === 0) return null;

  return (
    <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center pb-4">
      <div
        className="border-gray-150 max-h-full w-full min-w-[280px] max-w-[360px] overflow-auto rounded-2xl border bg-gray-50 p-4 pt-0 shadow-2xl"
        ref={mergeRefs([ref, localRef])}
      >
        <div className="sticky top-0 mb-2 flex items-center justify-center gap-2 bg-gray-50 py-4">
          <EditOutlined className="!h-5 !w-5 text-gray-500" />
          <h2 className="text-sm font-semibold leading-none">Edit</h2>
        </div>
        <div className="grid gap-2 overflow-auto">
          {selectedColumns?.map((column) => (
            <Input
              key={column}
              label={column}
              value={formValues[column] ?? ''}
              onChange={(newValue) => setFormValues({ ...formValues, [column]: newValue })}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
