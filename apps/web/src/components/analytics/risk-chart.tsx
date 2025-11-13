'use client';

import { Box, Paper, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { RiskDistribution } from '../../lib/api/analytics';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RiskChartProps {
  data: RiskDistribution[];
}

export function RiskChart({ data }: RiskChartProps) {
  const options = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
    },
    xaxis: {
      categories: data.map((d) => d.riskBand),
    },
    colors: ['#F44336', '#FF9800', '#00C48C'],
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: 'Orders',
      data: data.map((d) => d.count),
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Risk Distribution
      </Typography>
      <Box sx={{ height: 300 }}>
        <Chart options={options} series={series} type="bar" height={300} />
      </Box>
    </Paper>
  );
}

