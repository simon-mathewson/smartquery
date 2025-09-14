import { LineChart as MuiLineChart } from '@mui/x-charts';
import { useContext, useMemo } from 'react';
import { assert } from 'ts-essentials';
import { QueryContext, ResultContext } from '~/content/tabs/queries/query/Context';
import { isDateTimeType } from '~/shared/dataTypes/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';

export const LineChart = () => {
  const {
    query: { chart },
  } = useDefinedContext(QueryContext);
  const result = useContext(ResultContext);

  const xColumn = chart ? result?.columns?.find((column) => column.name === chart!.x) : null;

  const chartData = useMemo(() => {
    if (!result || !chart) {
      return null;
    }

    return result.rows.map((row) => {
      assert(xColumn);

      const x = row[chart!.x];
      const y = row[chart!.y];

      return {
        x: isDateTimeType(xColumn.dataType) && x !== null ? new Date(x) : x,
        y: Number(y),
      };
    });
  }, [result, chart, xColumn]);

  if (!chartData || !xColumn) {
    return null;
  }

  return (
    <MuiLineChart
      height={200}
      series={[
        {
          data: chartData.map((point) => point.y),
          baseline: 'min',
          area: true,
          showMark: false,
        },
      ]}
      xAxis={[
        {
          scaleType: 'time',
          data: chartData.map((point) => point.x),
          tickLabelMinGap: 8,
          label: chart!.x,
          valueFormatter: isDateTimeType(xColumn.dataType)
            ? (value) => value.toLocaleDateString()
            : undefined,
        },
      ]}
      yAxis={[{ scaleType: 'linear', min: 0, label: chart!.y }]}
      className="pr-4 [&_.MuiAreaElement-root]:!fill-[url('#gradient')] [&_.MuiChartsAxis-label_tspan]:fill-textSecondary [&_.MuiChartsAxis-label_tspan]:text-xs [&_.MuiChartsAxis-line]:!stroke-border [&_.MuiChartsAxis-tickLabel]:!fill-textSecondary [&_.MuiChartsAxis-tick]:!stroke-border [&_.MuiLineElement-root]:!stroke-primary"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </MuiLineChart>
  );
};
