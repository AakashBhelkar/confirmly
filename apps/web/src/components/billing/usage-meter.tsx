'use client';

import { Box, Paper, Typography, LinearProgress, Stack } from '@mui/material';
import { Usage } from '../../lib/api/billing';

interface UsageMeterProps {
  usage: Usage;
  limits: {
    orders: number;
    messages: number;
  };
}

export function UsageMeter({ usage, limits }: UsageMeterProps) {
  const ordersPercentage = (usage.orders / limits.orders) * 100;
  const messagesPercentage = (usage.messages / limits.messages) * 100;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Usage This Period
      </Typography>
      <Stack spacing={3}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Orders
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {usage.orders.toLocaleString()} / {limits.orders.toLocaleString()}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(ordersPercentage, 100)}
            color={ordersPercentage > 90 ? 'error' : ordersPercentage > 75 ? 'warning' : 'primary'}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Messages
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {usage.messages.toLocaleString()} / {limits.messages.toLocaleString()}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(messagesPercentage, 100)}
            color={messagesPercentage > 90 ? 'error' : messagesPercentage > 75 ? 'warning' : 'primary'}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Period: {new Date(usage.periodStart).toLocaleDateString()} - {new Date(usage.periodEnd).toLocaleDateString()}
        </Typography>
      </Stack>
    </Paper>
  );
}

