import { useContext, useMemo } from 'react';
import tailwindColors from 'tailwindcss/colors';
import { QueryContext, ResultContext } from '~/content/tabs/queries/query/Context';
import { compareColumnRefs } from '~/content/tabs/queries/utils/columnRefs';
import { ThemeContext } from '~/content/theme/Context';
import { primaryColors } from '~/content/theme/primaryColors';
import { isDateTimeType } from '~/shared/dataTypes/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { DbValue } from '@/connector/types';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';

export const Chart = () => {
  const { mode } = useDefinedContext(ThemeContext);
  const {
    query: { chart },
  } = useDefinedContext(QueryContext);
  const result = useContext(ResultContext);

  const xColumnIndex = chart
    ? result?.columns?.findIndex((column) =>
        compareColumnRefs(
          { column: chart.xColumn, table: chart.xTable, schema: null },
          { column: column.name, table: column.table?.name ?? null, schema: null },
        ),
      ) ?? null
    : null;
  const xColumn = xColumnIndex === null ? null : result?.columns?.[xColumnIndex] ?? null;

  const yColumnIndex = chart
    ? result?.columns?.findIndex((column) =>
        compareColumnRefs(
          { column: chart.yColumn, table: chart.yTable, schema: null },
          { column: column.name, table: column.table?.name ?? null, schema: null },
        ),
      ) ?? null
    : null;

  const chartData = useMemo(() => {
    if (
      !result ||
      !chart ||
      !xColumn ||
      xColumnIndex === null ||
      xColumnIndex < 0 ||
      yColumnIndex === null ||
      yColumnIndex < 0
    ) {
      return null;
    }

    return result.rows.map<{
      x: Date | DbValue;
      y: number;
    }>((row) => {
      const x = row[xColumnIndex];
      const y = Number(row[yColumnIndex]);

      if (isDateTimeType(xColumn.dataType) && x !== null) {
        // Normalize ISO with missing seconds (e.g. from Postgres timestamp)
        const xNormalized = x.replace(
          /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})\.(\d+)(Z|(\+|-)\d{2}:\d{2})?/,
          '$1:00.$2$3',
        );
        return { x: new Date(xNormalized), y };
      }

      return { x, y };
    });
  }, [result, chart, xColumn, xColumnIndex, yColumnIndex]);

  if (!chart || !chartData || !xColumn) {
    return null;
  }

  const valueFormatter = isDateTimeType(xColumn?.dataType)
    ? (value: Date) =>
        new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(value)
    : undefined;

  const colors = primaryColors.map((name) => tailwindColors[name][mode === 'dark' ? 500 : 600]);

  switch (chart.type) {
    case 'line':
      return (
        <LineChart
          chart={chart}
          colors={colors}
          data={chartData}
          valueFormatter={valueFormatter}
          xColumn={xColumn}
        />
      );
    case 'bar':
      return (
        <BarChart chart={chart} colors={colors} data={chartData} valueFormatter={valueFormatter} />
      );
    case 'pie':
      return <PieChart colors={colors} data={chartData} />;
  }
};
