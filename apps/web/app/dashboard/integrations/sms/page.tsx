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
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { integrationsApi } from '../../../../src/lib/api/integrations';
import { useToast } from '../../../../src/components/shared/toast';

interface SMSFormData {
  provider: 'msg91' | 'twilio';
  authKey?: string;
  senderId?: string;
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

export default function SMSIntegrationPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<SMSFormData>({
    defaultValues: {
      provider: 'msg91',
    },
  });

  const provider = watch('provider');

  const onSubmit = async (data: SMSFormData) => {
    setLoading(true);
    try {
      const credentials: Record<string, string> = {};
      if (provider === 'msg91') {
        credentials.authKey = data.authKey || '';
        credentials.senderId = data.senderId || '';
      } else {
        credentials.accountSid = data.accountSid || '';
        credentials.authToken = data.authToken || '';
        credentials.fromNumber = data.fromNumber || '';
      }

      await integrationsApi.connectSMS({
        provider,
        credentials,
      });
      toast.showSuccess('SMS provider connected successfully');
      router.push('/dashboard/integrations');
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Failed to connect SMS provider');
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
          Connect SMS Provider
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Connect MSG91 (India) or Twilio (Global) to send SMS confirmations.
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
                    <MenuItem value="msg91">MSG91 (India)</MenuItem>
                    <MenuItem value="twilio">Twilio (Global)</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {provider === 'msg91' ? (
              <>
                <Controller
                  name="authKey"
                  control={control}
                  rules={{ required: 'Auth Key is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Auth Key"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="senderId"
                  control={control}
                  rules={{ required: 'Sender ID is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Sender ID"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </>
            ) : (
              <>
                <Controller
                  name="accountSid"
                  control={control}
                  rules={{ required: 'Account SID is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Account SID"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="authToken"
                  control={control}
                  rules={{ required: 'Auth Token is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Auth Token"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="fromNumber"
                  control={control}
                  rules={{ required: 'From Number is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="From Number"
                      placeholder="+1234567890"
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
              {loading ? <CircularProgress size={24} /> : 'Connect SMS Provider'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

