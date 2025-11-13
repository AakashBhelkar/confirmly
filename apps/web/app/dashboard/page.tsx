'use client';

import { Box, Container, Grid, Card, CardContent, Typography, useTheme } from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SavingsIcon from '@mui/icons-material/Savings';
import MessageIcon from '@mui/icons-material/Message';
import { useDashboardData } from '../../src/hooks/use-dashboard';
import { useOrders } from '../../src/hooks/use-orders';
import { TrendChart } from '../../src/components/dashboard/trend-chart';
import { RecentActivity } from '../../src/components/dashboard/recent-activity';
import { LoadingSpinner } from '../../src/components/shared/loading';

export default function DashboardPage() {
  const theme = useTheme();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData(30);
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ limit: 10 });

  const isLoading = dashboardLoading || ordersLoading;

  const metrics = dashboardData?.metrics;
  const timeSeries = dashboardData?.timeSeries || [];
  const orders = ordersData?.data || [];

  // Calculate RTO reduction percentage
  const rtoReduction = metrics?.rtoReduction || 0;
  const confirmationRate = metrics?.confirmationRate || 0;
  const totalRevenue = metrics?.totalRevenue || 0;
  const messagesSent = metrics?.messagesSent || 0;

  // Estimate monthly savings (simplified calculation)
  const monthlySavings = totalRevenue * (rtoReduction / 100) * 0.3; // Assume 30% of RTO value is recoverable

  const stats = [
    {
      title: 'RTO Reduction',
      value: `${rtoReduction.toFixed(1)}%`,
      icon: <TrendingDownIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light + '20',
    },
    {
      title: 'Confirmation Rate',
      value: `${confirmationRate.toFixed(1)}%`,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + '20',
    },
    {
      title: 'Monthly Savings',
      value: `₹${monthlySavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: <SavingsIcon sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      bgColor: '#FFE0B2',
    },
    {
      title: 'Messages Sent',
      value: messagesSent.toLocaleString(),
      icon: <MessageIcon sx={{ fontSize: 40 }} />,
      color: '#9C27B0',
      bgColor: '#E1BEE7',
    },
  ];

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <LoadingSpinner message="Loading dashboard..." />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Overview
      </Typography>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: stat.bgColor,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <TrendChart data={timeSeries} title="Order Trends (Last 30 Days)" />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <RecentActivity orders={orders} />
        </Grid>
      </Grid>
    </Container>
  );
}

