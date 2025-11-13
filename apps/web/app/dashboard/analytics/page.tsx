'use client';

import { useState } from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Stack } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  useAnalyticsMetrics,
  useTimeSeries,
  useChannelPerformance,
  useRiskDistribution,
} from '../../../src/hooks/use-analytics';
import { FunnelChart } from '../../../src/components/analytics/funnel-chart';
import { ChannelChart } from '../../../src/components/analytics/channel-chart';
import { RiskChart } from '../../../src/components/analytics/risk-chart';
import { ROICalculator } from '../../../src/components/analytics/roi-calculator';
import { DateRangePicker } from '../../../src/components/analytics/date-range-picker';
import { LoadingSpinner } from '../../../src/components/shared/loading';
import dayjs, { Dayjs } from 'dayjs';

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const filters = {
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  };

  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics(filters);
  const { data: timeSeries, isLoading: timeSeriesLoading } = useTimeSeries(filters);
  const { data: channels, isLoading: channelsLoading } = useChannelPerformance(filters);
  const { data: risk, isLoading: riskLoading } = useRiskDistribution(filters);

  const handleExport = async () => {
    // TODO: Implement export
    console.log('Export analytics', filters);
  };

  const isLoading = metricsLoading || timeSeriesLoading || channelsLoading || riskLoading;

  // Create funnel data from metrics
  const funnelData = metrics?.data
    ? {
        labels: ['Total Orders', 'Contacted', 'Confirmed', 'Fulfilled'],
        values: [
          100,
          (metrics.data.confirmedOrders / metrics.data.totalOrders) * 100,
          (metrics.data.confirmedOrders / metrics.data.totalOrders) * 100,
          (metrics.data.confirmedOrders / metrics.data.totalOrders) * 100,
        ],
      }
    : { labels: [], values: [] };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Analytics
        </Typography>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
          Export
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </Paper>

      {isLoading ? (
        <LoadingSpinner message="Loading analytics..." />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <FunnelChart data={funnelData} />
            </Grid>
            <Grid item xs={12} md={4}>
              <ChannelChart data={channels?.data || []} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RiskChart data={risk?.data || []} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ROICalculator />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}

