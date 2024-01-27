import { EditOutlined } from '@mui/icons-material';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Query } from '~/content/queries/types';
import { Input } from '~/shared/components/Input/Input';

export type EditSidebarProps = {
  query: Query;
  selection: number[][];
};

export const EditSidebar = forwardRef<HTMLDivElement, EditSidebarProps>((props, ref) => {
  const { query, selection } = props;

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

  if (selection.length === 0) return null;

  return (
    <div
      className="flex h-full w-[280px] shrink-0 flex-col rounded-xl border border-gray-200 bg-gray-100 p-4 "
      ref={ref}
    >
      <div className="mb-4 flex items-center justify-center gap-2">
        <EditOutlined className="text-gray-500" />
        <h2 className="font-semibold leading-none">Edit</h2>
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
  );
});
