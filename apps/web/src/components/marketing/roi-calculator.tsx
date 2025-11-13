'use client';

import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Grid, Card, CardContent } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

export function ROICalculator() {
  const [results, setResults] = useState<{
    monthlyRTO: number;
    rtoReduction: number;
    monthlySavings: number;
    annualSavings: number;
  } | null>(null);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      monthlyOrders: 1000,
      averageOrderValue: 2000,
      currentRTORate: 15,
      rtoReductionPercent: 60,
    },
  });

  const calculateROI = (data: any) => {
    const monthlyRevenue = data.monthlyOrders * data.averageOrderValue;
    const monthlyRTO = monthlyRevenue * (data.currentRTORate / 100);
    const rtoReduction = monthlyRTO * (data.rtoReductionPercent / 100);
    const monthlySavings = rtoReduction * 0.3; // Assume 30% of RTO value is recoverable
    const annualSavings = monthlySavings * 12;

    setResults({
      monthlyRTO,
      rtoReduction,
      monthlySavings,
      annualSavings,
    });
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 700 }}>
        Calculate Your ROI
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
        See how much you can save with Confirmly
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4 }}>
            <form onSubmit={handleSubmit(calculateROI)}>
              <Stack spacing={3}>
                <Controller
                  name="monthlyOrders"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Monthly Orders"
                      error={!!fieldState.error}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />

                <Controller
                  name="averageOrderValue"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Average Order Value (₹)"
                      error={!!fieldState.error}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />

                <Controller
                  name="currentRTORate"
                  control={control}
                  rules={{ required: true, min: 0, max: 100 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Current RTO Rate (%)"
                      error={!!fieldState.error}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />

                <Controller
                  name="rtoReductionPercent"
                  control={control}
                  rules={{ required: true, min: 0, max: 100 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Expected RTO Reduction (%)"
                      helperText="Confirmly typically reduces RTO by 60%+"
                      error={!!fieldState.error}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />

                <Button type="submit" variant="contained" size="large" fullWidth>
                  Calculate ROI
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>

        {results && (
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Current Monthly RTO Loss
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    ₹{results.monthlyRTO.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Monthly Savings
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ₹{results.monthlySavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Annual Savings
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    ₹{results.annualSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

