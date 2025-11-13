'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { integrationsApi } from '../../../../src/lib/api/integrations';
import { useToast } from '../../../../src/components/shared/toast';

export default function ShopifyIntegrationPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await integrationsApi.connectShopify();
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Failed to connect Shopify');
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
          Connect Shopify Store
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Connect your Shopify store to automatically sync orders and enable automated confirmations.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          You'll be redirected to Shopify to authorize Confirmly. After authorization, you'll be
          redirected back to your dashboard.
        </Alert>

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              What we'll access:
            </Typography>
            <ul>
              <li>Read orders from your store</li>
              <li>Receive order updates via webhooks</li>
              <li>Access customer information for confirmations</li>
            </ul>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={handleConnect}
            disabled={loading}
            fullWidth
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Connect Shopify Store'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

