'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LinkIcon from '@mui/icons-material/Link';
import { useQuery } from '@tanstack/react-query';
import { integrationsApi } from '../../../src/lib/api/integrations';
import { LoadingSpinner } from '../../../src/components/shared/loading';
import { useRouter } from 'next/navigation';

export default function IntegrationsPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.getIntegrations(),
  });

  const integrations = data?.data || [];

  const getIntegrationStatus = (type: string) => {
    const integration = integrations.find((i) => i.type === type);
    return integration?.status || 'disconnected';
  };

  const integrationsList = [
    {
      type: 'shopify',
      name: 'Shopify',
      description: 'Connect your Shopify store to automatically sync orders',
      icon: '🛍️',
      status: getIntegrationStatus('shopify'),
      route: '/dashboard/integrations/shopify',
    },
    {
      type: 'whatsapp',
      name: 'WhatsApp',
      description: 'Connect WhatsApp Business API to send confirmation messages',
      icon: '💬',
      status: getIntegrationStatus('whatsapp'),
      route: '/dashboard/integrations/whatsapp',
    },
    {
      type: 'sms',
      name: 'SMS',
      description: 'Connect MSG91 or Twilio for SMS confirmations',
      icon: '📱',
      status: getIntegrationStatus('sms'),
      route: '/dashboard/integrations/sms',
    },
    {
      type: 'email',
      name: 'Email',
      description: 'Connect SendGrid or AWS SES for email confirmations',
      icon: '📧',
      status: getIntegrationStatus('email'),
      route: '/dashboard/integrations/email',
    },
  ];

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <LoadingSpinner message="Loading integrations..." />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Integrations
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Connect your services to automate order confirmations across multiple channels.
      </Typography>

      <Grid container spacing={3}>
        {integrationsList.map((integration) => (
          <Grid item xs={12} md={6} key={integration.type}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h4">{integration.icon}</Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{integration.name}</Typography>
                    <Chip
                      label={integration.status}
                      size="small"
                      color={
                        integration.status === 'connected'
                          ? 'success'
                          : integration.status === 'error'
                          ? 'error'
                          : 'default'
                      }
                      icon={
                        integration.status === 'connected' ? (
                          <CheckCircleIcon />
                        ) : integration.status === 'error' ? (
                          <ErrorIcon />
                        ) : undefined
                      }
                    />
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {integration.description}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button
                  size="small"
                  startIcon={<LinkIcon />}
                  onClick={() => router.push(integration.route)}
                  fullWidth
                >
                  {integration.status === 'connected' ? 'Manage' : 'Connect'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

