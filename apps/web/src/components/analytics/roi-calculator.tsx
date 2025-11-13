'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Divider,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';

export function ROICalculator() {
  const [monthlyOrders, setMonthlyOrders] = useState(1000);
  const [avgOrderValue, setAvgOrderValue] = useState(1500);
  const [rtoRate, setRtoRate] = useState(15);
  const [confirmationRate, setConfirmationRate] = useState(95);

  const calculateROI = () => {
    const totalRevenue = monthlyOrders * avgOrderValue;
    const rtoLoss = (totalRevenue * rtoRate) / 100;
    const rtoReduction = rtoLoss * 0.6; // 60% reduction
    const savings = rtoReduction * (confirmationRate / 100);
    const monthlySavings = savings;
    const annualSavings = monthlySavings * 12;

    return {
      totalRevenue,
      rtoLoss,
      rtoReduction,
      monthlySavings,
      annualSavings,
    };
  };

  const roi = calculateROI();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        ROI Calculator
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Monthly Orders"
            value={monthlyOrders}
            onChange={(e) => setMonthlyOrders(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Average Order Value (₹)"
            value={avgOrderValue}
            onChange={(e) => setAvgOrderValue(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Current RTO Rate (%)"
            value={rtoRate}
            onChange={(e) => setRtoRate(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Confirmation Rate (%)"
            value={confirmationRate}
            onChange={(e) => setConfirmationRate(Number(e.target.value))}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Monthly Revenue:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            ₹{roi.totalRevenue.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Current RTO Loss:
          </Typography>
          <Typography variant="body1" color="error.main" sx={{ fontWeight: 600 }}>
            ₹{roi.rtoLoss.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            RTO Reduction (60%):
          </Typography>
          <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
            ₹{roi.rtoReduction.toLocaleString()}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Monthly Savings:
          </Typography>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
            ₹{roi.monthlySavings.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Annual Savings:
          </Typography>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
            ₹{roi.annualSavings.toLocaleString()}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

