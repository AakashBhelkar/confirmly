'use client';

import { useState } from 'react';
import { Box, Typography, Button, Stack, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { integrationsApi } from '../../../lib/api/integrations';

interface ConnectShopifyStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function ConnectShopifyStep({ onNext, onBack, onSkip }: ConnectShopifyStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await integrationsApi.connectShopify();
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error('Failed to connect Shopify:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Connect your Shopify store
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Connect your Shopify store to automatically sync orders and enable automated confirmations.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        You can skip this step and connect Shopify later from the Integrations page.
      </Alert>

      <Stack spacing={2}>
        <Button
          variant="contained"
          size="large"
          onClick={handleConnect}
          disabled={loading}
          fullWidth
        >
          Connect Shopify Store
        </Button>
        <Button variant="outlined" onClick={onSkip} fullWidth>
          Skip for now
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
        <Button onClick={onBack}>Back</Button>
      </Stack>
    </Box>
  );
}

