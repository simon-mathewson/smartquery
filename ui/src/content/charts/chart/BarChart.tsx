import type { Chart } from '@/savedQueries/types';
import { BarChart as MuiBarChart } from '@mui/x-charts';
import type { Value } from '~/shared/types';

export type BarChartProps = {
  chart: Chart;
  data: { x: Date | Value; y: number }[];
  valueFormatter: ((value: Date) => string) | undefined;
};

export const BarChart = (props: BarChartProps) => {
  const { chart, data, valueFormatter } = props;

  return (
    <MuiBarChart
      height={200}
      series={[{ dataKey: 'y' }]}
      dataset={data}
      xAxis={[
        {
          dataKey: 'x',
          label: chart.x,
          valueFormatter,
        },
      ]}
      yAxis={[
        {
          scaleType: 'linear',
          label: chart.y,
        },
      ]}
      className="[&_.MuiChartsAxis-label_tspan]:text-xs [&_.MuiChartsAxis-line]:!stroke-border [&_.MuiChartsAxis-tickLabel]:!fill-textSecondary [&_.MuiChartsAxis-tick]:!stroke-border [&_.MuiLineElement-root]:!stroke-primary"
    />
  );
};
