'use client';

import { Box, Paper, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { TimeSeriesData } from '../../lib/api/analytics';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TrendChartProps {
  data: TimeSeriesData[];
  title: string;
}

export function TrendChart({ data, title }: TrendChartProps) {
  const chartData = {
    series: [
      {
        name: 'Orders',
        data: data.map((item) => item.orders),
      },
      {
        name: 'Confirmed',
        data: data.map((item) => item.confirmed),
      },
    ],
    options: {
      chart: {
        type: 'line' as const,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      stroke: {
        curve: 'smooth' as const,
        width: 2,
      },
      xaxis: {
        categories: data.map((item) => new Date(item.date).toLocaleDateString()),
      },
      yaxis: {
        title: { text: 'Count' },
      },
      legend: {
        position: 'top' as const,
      },
      colors: ['#3C73FF', '#4CAF50'],
    },
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      <Box sx={{ height: 300 }}>
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={300}
        />
      </Box>
    </Paper>
  );
}

