'use client';

import { useState } from 'react';
import { Box, Typography, Button, Stack, FormControlLabel, Checkbox, Alert } from '@mui/material';
import { merchantApi } from '../../../lib/api/merchants';
import { useToast } from '../../shared/toast';

interface ChooseChannelsStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export function ChooseChannelsStep({ onNext, onBack, initialData }: ChooseChannelsStepProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState({
    whatsapp: initialData?.channels?.whatsapp || false,
    sms: initialData?.channels?.sms || false,
    email: initialData?.channels?.email || false,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await merchantApi.updateChannels({
        whatsapp: channels.whatsapp ? {} : null,
        sms: channels.sms ? {} : null,
        email: channels.email ? {} : null,
      });
      onNext({ channels });
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Failed to update channels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Choose communication channels
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select which channels you want to use for order confirmations. You can configure them later.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        You'll need to connect these channels in the Integrations page after onboarding.
      </Alert>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={channels.whatsapp}
              onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                WhatsApp
              </Typography>
              <Typography variant="caption" color="text.secondary">
                High engagement, instant delivery
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={channels.sms}
              onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                SMS
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Universal reach, reliable delivery
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={channels.email}
              onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Email
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cost-effective, rich content
              </Typography>
            </Box>
          }
        />
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Continue
        </Button>
      </Stack>
    </Box>
  );
}

