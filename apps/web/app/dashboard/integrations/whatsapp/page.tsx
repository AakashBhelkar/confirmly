'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { integrationsApi } from '../../../../src/lib/api/integrations';
import { useToast } from '../../../../src/components/shared/toast';

interface WhatsAppFormData {
  phoneNumberId: string;
  accessToken: string;
}

export default function WhatsAppIntegrationPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<WhatsAppFormData>({
    defaultValues: {
      phoneNumberId: '',
      accessToken: '',
    },
  });

  const onSubmit = async (data: WhatsAppFormData) => {
    setLoading(true);
    try {
      await integrationsApi.connectWhatsApp(data);
      toast.showSuccess('WhatsApp connected successfully');
      router.push('/dashboard/integrations');
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Failed to connect WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back to Integrations
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Connect WhatsApp Business API
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Connect your WhatsApp Business API to send confirmation messages to customers.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          You'll need your WhatsApp Business API credentials from Meta Business Suite.
        </Alert>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="phoneNumberId"
              control={control}
              rules={{ required: 'Phone Number ID is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone Number ID"
                  placeholder="123456789012345"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || 'Your WhatsApp Business Phone Number ID'}
                />
              )}
            />

            <Controller
              name="accessToken"
              control={control}
              rules={{ required: 'Access Token is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label="Access Token"
                  placeholder="Your WhatsApp API access token"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || 'Your WhatsApp Business API access token'}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Connect WhatsApp'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

