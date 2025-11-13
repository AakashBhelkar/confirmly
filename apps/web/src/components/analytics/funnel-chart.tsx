'use client';

import { Box, Paper, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface FunnelChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function FunnelChart({ data }: FunnelChartProps) {
  const options = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
    },
    xaxis: {
      categories: data.labels,
    },
    colors: ['#3C73FF', '#00C48C', '#FF9800', '#F44336'],
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: 'Percentage',
      data: data.values,
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Confirmation Funnel
      </Typography>
      <Box sx={{ height: 300 }}>
        <Chart options={options} series={series} type="bar" height={300} />
      </Box>
    </Paper>
  );
}

