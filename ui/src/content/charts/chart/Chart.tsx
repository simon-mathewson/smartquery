import { useContext, useMemo } from 'react';
import tailwindColors from 'tailwindcss/colors';
import { QueryContext, ResultContext } from '~/content/tabs/queries/query/Context';
import { compareColumnRefs } from '~/content/tabs/queries/utils/columnRefs';
import { ThemeContext } from '~/content/theme/Context';
import { primaryColors } from '~/content/theme/primaryColors';
import { isDateTimeType } from '~/shared/dataTypes/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Value } from '~/shared/types';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';

export const Chart = () => {
  const { mode } = useDefinedContext(ThemeContext);
  const {
    query: { chart },
  } = useDefinedContext(QueryContext);
  const result = useContext(ResultContext);

  const xColumn = chart
    ? result?.columns?.find((column) =>
        compareColumnRefs(
          { column: chart.xColumn, table: chart.xTable },
          { column: column.name, table: column.table?.name ?? null },
        ),
      )
    : null;

  const chartData = useMemo(() => {
    if (!result || !chart || !xColumn) {
      return null;
    }

    return result.rows.map<{
      x: Date | Value;
      y: number;
    }>((row) => {
      const x = row[chart.xColumn];
      const y = Number(chart.yColumn ? row[chart.yColumn] : null);

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
  }, [result, chart, xColumn]);

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
