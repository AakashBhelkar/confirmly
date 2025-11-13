'use client';

import { Box, Paper, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { ChannelPerformance } from '../../lib/api/analytics';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChannelChartProps {
  data: ChannelPerformance[];
}

export function ChannelChart({ data }: ChannelChartProps) {
  const options = {
    chart: {
      type: 'donut' as const,
    },
    labels: data.map((d) => d.channel.toUpperCase()),
    colors: ['#00C48C', '#3C73FF', '#FF9800'],
    legend: {
      position: 'bottom' as const,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Messages',
              formatter: () => {
                const total = data.reduce((sum, d) => sum + d.sent, 0);
                return total.toString();
              },
            },
          },
        },
      },
    },
  };

  const series = data.map((d) => d.sent);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Channel Performance
      </Typography>
      <Box sx={{ height: 350 }}>
        <Chart options={options} series={series} type="donut" height={350} />
      </Box>
    </Paper>
  );
}

