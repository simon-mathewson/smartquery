import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { LineChart } from './LineChart';
import { QueryContext, ResultContext } from '~/content/tabs/queries/query/Context';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { useContext, useMemo } from 'react';
import { assert } from 'ts-essentials';
import { isDateTimeType } from '~/shared/dataTypes/utils';
import { ThemeContext } from '~/content/theme/Context';
import tailwindColors from 'tailwindcss/colors';
import { primaryColors } from '~/content/theme/primaryColors';

export const Chart = () => {
  const { mode } = useDefinedContext(ThemeContext);
  const {
    query: { chart },
  } = useDefinedContext(QueryContext);
  const result = useContext(ResultContext);

  const xColumn = chart
    ? result?.columns?.find(
        (column) => column.name === chart.xColumn && (column.table?.name ?? null) === chart.xTable,
      )
    : null;

  const chartData = useMemo(() => {
    if (!result || !chart) {
      return null;
    }

    return result.rows.map((row) => {
      assert(xColumn);

      const x = row[chart.xColumn];
      const y = chart.yColumn ? row[chart.yColumn] : null;

      return {
        x: isDateTimeType(xColumn.dataType) && x !== null ? new Date(x) : x,
        y: Number(y),
      };
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
          data={chartData.filter(
            (data): data is { x: string | Date; y: number } => data.x !== null,
          )}
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
