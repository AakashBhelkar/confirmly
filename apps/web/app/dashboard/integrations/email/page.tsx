'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { integrationsApi } from '../../../../src/lib/api/integrations';
import { useToast } from '../../../../src/components/shared/toast';

interface EmailFormData {
  provider: 'sendgrid' | 'ses';
  apiKey?: string;
  fromEmail?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
}

export default function EmailIntegrationPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<EmailFormData>({
    defaultValues: {
      provider: 'sendgrid',
    },
  });

  const provider = watch('provider');

  const onSubmit = async (data: EmailFormData) => {
    setLoading(true);
    try {
      const credentials: Record<string, string> = {};
      if (provider === 'sendgrid') {
        credentials.apiKey = data.apiKey || '';
        credentials.fromEmail = data.fromEmail || '';
      } else {
        credentials.accessKeyId = data.accessKeyId || '';
        credentials.secretAccessKey = data.secretAccessKey || '';
        credentials.region = data.region || 'us-east-1';
      }

      await integrationsApi.connectEmail({
        provider,
        credentials,
      });
      toast.showSuccess('Email provider connected successfully');
      router.push('/dashboard/integrations');
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Failed to connect email provider');
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
          Connect Email Provider
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Connect SendGrid or AWS SES to send email confirmations.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="provider"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Provider</InputLabel>
                  <Select {...field} label="Provider">
                    <MenuItem value="sendgrid">SendGrid</MenuItem>
                    <MenuItem value="ses">AWS SES</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {provider === 'sendgrid' ? (
              <>
                <Controller
                  name="apiKey"
                  control={control}
                  rules={{ required: 'API Key is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="API Key"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="fromEmail"
                  control={control}
                  rules={{ required: 'From Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="email"
                      label="From Email"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </>
            ) : (
              <>
                <Controller
                  name="accessKeyId"
                  control={control}
                  rules={{ required: 'Access Key ID is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Access Key ID"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="secretAccessKey"
                  control={control}
                  rules={{ required: 'Secret Access Key is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Secret Access Key"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="region"
                  control={control}
                  rules={{ required: 'Region is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Region"
                      placeholder="us-east-1"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Connect Email Provider'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

