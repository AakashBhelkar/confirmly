'use client';

import { Box, TextField, MenuItem, Button, Grid } from '@mui/material';
import { OrderFilters } from '../../lib/api/orders';

interface OrderFiltersProps {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
  onReset: () => void;
}

export function OrderFiltersComponent({ filters, onChange, onReset }: OrderFiltersProps) {
  const handleStatusChange = (status: string) => {
    onChange({ ...filters, status: status as any, page: 1 });
  };

  const handlePaymentModeChange = (paymentMode: string) => {
    onChange({ ...filters, paymentMode: paymentMode as any, page: 1 });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Status"
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="unconfirmed">Unconfirmed</MenuItem>
            <MenuItem value="canceled">Canceled</MenuItem>
            <MenuItem value="fulfilled">Fulfilled</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Payment Mode"
            value={filters.paymentMode || ''}
            onChange={(e) => handlePaymentModeChange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="cod">COD</MenuItem>
            <MenuItem value="prepaid">Prepaid</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="outlined" onClick={onReset} fullWidth>
            Reset Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

