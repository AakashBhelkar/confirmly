'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../../contexts/auth-context';
import { useToast } from '../../shared/toast';
import { merchantApi } from '../../../lib/api/merchants';

interface BusinessInfoStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export function BusinessInfoStep({ onNext, onBack, initialData }: BusinessInfoStepProps) {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      merchantName: initialData?.merchantName || '',
      website: initialData?.website || '',
      industry: initialData?.industry || '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await merchantApi.updateMerchant({
        name: data.merchantName,
        domains: data.website ? [data.website] : [],
      });
      await refreshUser();
      onNext(data);
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Failed to update business info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Tell us about your business
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Controller
            name="merchantName"
            control={control}
            rules={{ required: 'Business name is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label="Business Name"
                placeholder="My Store"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="website"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label="Website (optional)"
                placeholder="https://mystore.com"
                type="url"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Industry (optional)"
                placeholder="Fashion, Electronics, etc."
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

