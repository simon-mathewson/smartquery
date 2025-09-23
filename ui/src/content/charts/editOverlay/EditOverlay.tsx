import type { Chart } from '@/savedQueries/types';
import { BarChartOutlined, DeleteOutline, Done } from '@mui/icons-material';
import { useCallback, useContext, useRef, useState } from 'react';
import { SavedQueriesContext } from '~/content/savedQueries/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { QueryContext, ResultContext } from '~/content/tabs/queries/query/Context';
import type { ColumnRef } from '~/content/tabs/queries/utils/getColumnRef';
import { ToastContext } from '~/content/toast/Context';
import { Button } from '~/shared/components/button/Button';
import { ConfirmDeletePopover } from '~/shared/components/confirmDeletePopover/ConfirmDeletePopover';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Select } from '~/shared/components/select/Select';
import type { DataType } from '~/shared/dataTypes/types';
import { isDateOrTimeType, isNumberType } from '~/shared/dataTypes/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';

export const ChartEditOverlay: React.FC = () => {
  const toast = useDefinedContext(ToastContext);
  const { query } = useDefinedContext(QueryContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { updateSavedQuery } = useDefinedContext(SavedQueriesContext);
  const result = useContext(ResultContext);

  const chart = query.chart;

  const triggerRef = useRef<HTMLButtonElement>(null);

  const overlay = useOverlay({
    triggerRef,
  });

  const [type, setType] = useState<Chart['type']>(chart?.type ?? 'line');
  const [x, setX] = useState<ColumnRef | null>(
    chart?.xColumn ? { column: chart.xColumn, table: chart.xTable } : null,
  );
  const [y, setY] = useState<ColumnRef | null>(
    chart?.yColumn ? { column: chart.yColumn, table: chart.yTable } : null,
  );

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>, close: () => void) => {
      event.preventDefault();

      const chart = {
        type,
        xColumn: x?.column ?? null,
        xTable: x?.table ?? null,
        yColumn: y?.column ?? null,
        yTable: y?.table ?? null,
      } as Chart;

      setIsSaving(true);

      if (query.savedQueryId) {
        await updateSavedQuery(query.savedQueryId, { chart }, query.id, close);
      } else {
        try {
          await updateQuery({ id: query.id, chart });

          close();
          toast.add({
            color: 'success',
            title: 'Chart saved',
          });
        } catch (error) {
          console.error(error);
          toast.add({
            color: 'danger',
            title: 'Failed to save chart',
          });
        }
      }

      setIsSaving(false);
    },
    [query.id, query.savedQueryId, toast, type, updateQuery, updateSavedQuery, x, y],
  );

  const deleteChart = useCallback(
    async (close: () => void) => {
      setIsSaving(true);

      if (query.savedQueryId) {
        await updateSavedQuery(query.savedQueryId, { chart: null }, query.id, close);
      } else {
        try {
          await updateQuery({ id: query.id, chart: null });

          close();
          toast.add({
            color: 'success',
            title: 'Chart deleted',
          });
        } catch (error) {
          console.error(error);
          toast.add({
            color: 'danger',
            title: 'Failed to delete chart',
          });
        }
      }

      setIsSaving(false);
    },
    [query.id, query.savedQueryId, toast, updateQuery, updateSavedQuery],
  );

  const getIsAllowed = (axis: 'x' | 'y', dataType: DataType) => {
    if (axis === 'x' && type === 'line') {
      return isNumberType(dataType) || isDateOrTimeType(dataType);
    }
    if (axis === 'y') {
      return isNumberType(dataType);
    }
    return true;
  };

  const getColumnOptions = (axis: 'x' | 'y') =>
    result?.columns
      ?.filter((column) => column.isVisible)
      .map((column) => ({
        disabled: !getIsAllowed(axis, column.dataType),
        label:
          column.table && result.tables.length > 1
            ? `${column.table.name}.${column.name}`
            : column.name,
        value: { column: column.name, table: column.table?.name ?? null },
      })) ?? [];

  return (
    <>
      <OverlayCard htmlProps={{ className: 'w-[250px]' }} overlay={overlay}>
        {({ close }) => (
          <>
            <Header
              middle={
                <div className="text-center text-sm font-medium text-textPrimary">
                  {chart ? 'Chart' : 'Create chart'}
                </div>
              }
              right={
                chart && (
                  <ConfirmDeletePopover
                    onConfirm={() => deleteChart(close)}
                    renderTrigger={(buttonProps) => (
                      <Button
                        color="danger"
                        htmlProps={buttonProps}
                        icon={<DeleteOutline />}
                        tooltip="Delete chart"
                      />
                    )}
                    text="Delete chart"
                  />
                )
              }
            />
            <form className="space-y-1" onSubmit={(event) => onSubmit(event, close)}>
              <Field label="Type">
                <Select<Chart['type']>
                  value={type}
                  htmlProps={{ autoFocus: true, disabled: isSaving }}
                  onChange={setType}
                  options={[
                    {
                      label: 'Bar',
                      value: 'bar',
                    },
                    {
                      label: 'Line',
                      value: 'line',
                    },
                    {
                      label: 'Pie',
                      value: 'pie',
                    },
                  ]}
                />
              </Field>
              <Field label={type === 'pie' ? 'Label' : 'X axis'}>
                <Select<ColumnRef | null>
                  compareFn={(a, b) =>
                    Boolean(a && b && a.column === b.column && a.table === b.table)
                  }
                  htmlProps={{ disabled: isSaving }}
                  onChange={setX}
                  options={getColumnOptions('x')}
                  value={x}
                />
              </Field>
              <Field
                hint="Values with the same label will be summed up"
                label={type === 'pie' ? 'Value' : 'Y axis'}
              >
                <Select<ColumnRef | null>
                  compareFn={(a, b) =>
                    (!a && !b) || (a?.column === b?.column && a?.table === b?.table)
                  }
                  htmlProps={{ disabled: isSaving }}
                  onChange={setY}
                  options={[
                    ...(type === 'pie' ? [{ label: 'None', value: null }] : []),
                    ...getColumnOptions('y'),
                  ]}
                  value={y}
                />
              </Field>
              <Button
                icon={<Done />}
                htmlProps={{
                  className: 'w-full',
                  disabled:
                    isSaving ||
                    Boolean(
                      chart &&
                        chart.type === type &&
                        chart.xColumn === x?.column &&
                        chart.xTable === x?.table &&
                        chart.yColumn === y?.column &&
                        chart.yTable === y?.table,
                    ) ||
                    !x?.column ||
                    (type !== 'pie' && !y?.column),
                  type: 'submit',
                }}
                label={chart ? 'Update' : 'Create'}
                variant="filled"
              />
            </form>
          </>
        )}
      </OverlayCard>
      <Button
        color="secondary"
        icon={<BarChartOutlined />}
        htmlProps={{ disabled: !chart && !result?.columns, ref: triggerRef }}
        label="Chart"
        size="small"
      />
    </>
  );
};
