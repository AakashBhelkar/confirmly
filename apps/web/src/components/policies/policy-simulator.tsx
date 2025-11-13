'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';

interface PolicySimulatorProps {
  onTest: (orderData: any) => Promise<{ effect: string; matchedRules: any[] }>;
}

export function PolicySimulator({ onTest }: PolicySimulatorProps) {
  const [result, setResult] = useState<{ effect: string; matchedRules: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      riskScore: 75,
      amount: 1000,
      paymentMode: 'cod',
      customerCity: 'Mumbai',
      orderCount: 1,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const testResult = await onTest(data);
      setResult(testResult);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const effectColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
    confirm: 'success',
    skip: 'warning',
    cancel: 'error',
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('riskScore', { valueAsNumber: true })}
              fullWidth
              type="number"
              label="Risk Score"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('amount', { valueAsNumber: true })}
              fullWidth
              type="number"
              label="Order Amount"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('paymentMode')}
              fullWidth
              select
              SelectProps={{ native: true }}
              label="Payment Mode"
            >
              <option value="cod">COD</option>
              <option value="prepaid">Prepaid</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('customerCity')}
              fullWidth
              label="Customer City"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('orderCount', { valueAsNumber: true })}
              fullWidth
              type="number"
              label="Order Count"
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" disabled={loading} fullWidth>
          Test Policy
        </Button>
      </form>

      {result && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Test Result
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Action:
              </Typography>
              <Chip
                label={result.effect}
                color={effectColors[result.effect] || 'default'}
                size="medium"
              />
            </Box>
            {result.matchedRules && result.matchedRules.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Matched Rules:
                </Typography>
                <Stack spacing={1}>
                  {result.matchedRules.map((rule: any, index: number) => (
                    <Alert key={index} severity="info">
                      Rule {index + 1}: {rule.key} {rule.operator} {String(rule.value)}
                    </Alert>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

