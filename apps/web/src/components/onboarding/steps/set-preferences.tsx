'use client';

import { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, FormControlLabel, Switch } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { merchantApi } from '../../../lib/api/merchants';
import { useToast } from '../../shared/toast';

interface SetPreferencesStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export function SetPreferencesStep({ onNext, onBack, initialData }: SetPreferencesStepProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      confirmWindowHours: initialData?.confirmWindowHours || 24,
      autoCancelUnconfirmed: initialData?.autoCancelUnconfirmed || false,
      confirmCODOnly: initialData?.confirmCODOnly ?? true,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await merchantApi.updateMerchant({
        settings: {
          confirmWindowHours: parseInt(data.confirmWindowHours),
          autoCancelUnconfirmed: data.autoCancelUnconfirmed,
          confirmCODOnly: data.confirmCODOnly,
        },
      });
      onNext(data);
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Set your preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how Confirmly should handle order confirmations.
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Controller
            name="confirmWindowHours"
            control={control}
            rules={{ required: 'Confirmation window is required', min: 1, max: 168 }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                label="Confirmation Window (hours)"
                helperText="How long to wait for customer confirmation before auto-canceling"
                error={!!fieldState.error}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            )}
          />

          <Controller
            name="confirmCODOnly"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Confirm COD orders only"
              />
            )}
          />

          <Controller
            name="autoCancelUnconfirmed"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Auto-cancel unconfirmed orders"
              />
            )}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onBack}>Back</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Continue
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

