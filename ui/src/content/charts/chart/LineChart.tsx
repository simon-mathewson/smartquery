import type { Chart } from '@/savedQueries/types';
import { LineChart as MuiLineChart } from '@mui/x-charts';
import { assert } from 'ts-essentials';
import { isDateTimeType } from '~/shared/dataTypes/utils';
import type { Column } from '~/shared/types';

export type LineChartProps = {
  chart: Chart;
  colors: string[];
  data: { x: Date | string; y: number }[];
  valueFormatter: ((value: Date) => string) | undefined;
  xColumn: Column;
};

export const LineChart = (props: LineChartProps) => {
  const { chart, colors, data, valueFormatter, xColumn } = props;

  assert(chart.yColumn, 'Y axis is required');

  return (
    <MuiLineChart
      colors={colors}
      height={200}
      series={[
        {
          data: data.map((point) => point.y),
          baseline: 'min',
          area: true,
          showMark: false,
        },
      ]}
      xAxis={[
        {
          scaleType: isDateTimeType(xColumn.dataType) ? 'time' : 'linear',
          data: data.map((point) => point.x),
          tickLabelMinGap: 8,
          label: chart.xColumn,
          valueFormatter,
        },
      ]}
      yAxis={[{ scaleType: 'linear', min: 0, label: chart.yColumn }]}
      className="pr-4 [&_.MuiAreaElement-root]:!fill-[url('#gradient')] [&_.MuiChartsAxis-label_tspan]:fill-textSecondary [&_.MuiChartsAxis-label_tspan]:text-xs [&_.MuiChartsAxis-line]:!stroke-border [&_.MuiChartsAxis-tickLabel]:!fill-textSecondary [&_.MuiChartsAxis-tick]:!stroke-border [&_.MuiLineElement-root]:!stroke-blue-600 dark:[&_.MuiLineElement-root]:!stroke-blue-500"
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
