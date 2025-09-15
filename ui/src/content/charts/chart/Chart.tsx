import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { LineChart } from './LineChart';
import { QueryContext, ResultContext } from '~/content/tabs/queries/query/Context';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { useContext, useMemo } from 'react';
import { assert } from 'ts-essentials';
import { isDateTimeType } from '~/shared/dataTypes/utils';

export const Chart = () => {
  const {
    query: { chart },
  } = useDefinedContext(QueryContext);
  const result = useContext(ResultContext);

  const xColumn = chart ? result?.columns?.find((column) => column.name === chart.x) : null;

  const chartData = useMemo(() => {
    if (!result || !chart) {
      return null;
    }

    return result.rows.map((row) => {
      assert(xColumn);

      const x = row[chart.x];
      const y = row[chart.y];

      return {
        x: isDateTimeType(xColumn.dataType) && x !== null ? new Date(x) : x,
        y: Number(y),
      };
    });
  }, [result, chart, xColumn]);

  const chartDataGrouped = useMemo(() => {
    if (!chartData) {
      return null;
    }

    const grouped: { x: string | Date | null; y: number }[] = [];

    chartData.forEach((data) => {
      const existing = grouped.find((group) => String(group.x) === String(data.x));
      if (existing) {
        existing.y += data.y;
      } else {
        grouped.push({ x: data.x, y: data.y });
      }
    });

    return grouped;
  }, [chartData]);

  if (!chart || !chartDataGrouped || !xColumn) {
    return null;
  }

  const valueFormatter = isDateTimeType(xColumn?.dataType)
    ? (value: Date) => value.toLocaleDateString()
    : undefined;

  switch (chart.type) {
    case 'line':
      return (
        <LineChart
          chart={chart}
          data={
            chartDataGrouped.filter((data) => data.x !== null) as { x: string | Date; y: number }[]
          }
          valueFormatter={valueFormatter}
          xColumn={xColumn}
        />
      );
    case 'bar':
      return <BarChart chart={chart} data={chartDataGrouped} valueFormatter={valueFormatter} />;
    case 'pie':
      return <PieChart data={chartDataGrouped} />;
  }
};
