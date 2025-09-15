import { PieChart as MuiPieChart } from '@mui/x-charts';
import { useMemo } from 'react';
import type { Value } from '~/shared/types';

export type PieChartProps = {
  data: { x: Date | Value; y: number }[];
};

export const PieChart = (props: PieChartProps) => {
  const { data: dataProp } = props;

  const chartData = useMemo(
    () =>
      dataProp.map((point, index) => ({
        id: index,
        value: Number(point.y),
        label: String(point.x),
      })),
    [dataProp],
  );

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="[&_.MuiChartsLegend-root]:!h-[200px]">
      <MuiPieChart
        height={200}
        series={[
          {
            data: chartData,
            valueFormatter: ({ value }) => {
              return `${((value / total) * 100).toFixed(2)}%`;
            },
          },
        ]}
        dataset={chartData}
        className="[&_.MuiChartsAxis-label_tspan]:fill-textSecondary [&_.MuiChartsAxis-label_tspan]:text-xs"
      />
    </div>
  );
};
