'use client';

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography } from '@mui/material';
import { Order } from '../../lib/api/orders';
import { RiskScoreBadge } from '../orders/risk-score-badge';

interface RecentActivityProps {
  orders: Order[];
}

export function RecentActivity({ orders }: RecentActivityProps) {
  const statusColors: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
    confirmed: 'success',
    pending: 'warning',
    canceled: 'error',
    unconfirmed: 'error',
    fulfilled: 'default',
  };

  return (
    <Paper>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Recent Activity
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Risk Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No recent orders
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.slice(0, 10).map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {order.id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.email || order.phone || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {order.currency} {order.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <RiskScoreBadge score={order.riskScore} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      color={statusColors[order.status] || 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

