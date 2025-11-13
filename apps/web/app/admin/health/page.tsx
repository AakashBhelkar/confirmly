'use client';

import { AuthGuard } from '../../../src/components/auth/auth-guard';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { useProviderHealth } from '../../../src/hooks/use-admin';
import { LoadingSpinner } from '../../../src/components/shared/loading';

export default function ProviderHealthPage() {
  const { data, isLoading } = useProviderHealth();

  if (isLoading) {
    return <LoadingSpinner message="Loading provider health..." />;
  }

  const health = data?.data || {
    whatsapp: { status: 'unknown', lastCheck: null },
    sms: { status: 'unknown', lastCheck: null },
    email: { status: 'unknown', lastCheck: null },
  };

  const providers = [
    {
      name: 'WhatsApp',
      key: 'whatsapp',
      icon: '💬',
    },
    {
      name: 'SMS (MSG91)',
      key: 'msg91',
      icon: '📱',
    },
    {
      name: 'SMS (Twilio)',
      key: 'twilio',
      icon: '📱',
    },
    {
      name: 'Email (SendGrid)',
      key: 'sendgrid',
      icon: '📧',
    },
    {
      name: 'Email (SES)',
      key: 'ses',
      icon: '📧',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'down':
        return <ErrorIcon color="error" />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  return (
    <AuthGuard requiredRole="superadmin">
      <Grid container spacing={3}>
      {providers.map((provider) => {
        const providerHealth = health[provider.key] || { status: 'unknown', lastCheck: null };
        return (
          <Grid item xs={12} md={6} key={provider.key}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h4">{provider.icon}</Typography>
                  <Typography variant="h6">{provider.name}</Typography>
                </Box>
                {getStatusIcon(providerHealth.status)}
              </Box>
              <Chip
                label={providerHealth.status.toUpperCase()}
                color={getStatusColor(providerHealth.status) as any}
                size="small"
                sx={{ mb: 2 }}
              />
              {providerHealth.lastCheck && (
                <Typography variant="caption" color="text.secondary">
                  Last checked: {new Date(providerHealth.lastCheck).toLocaleString()}
                </Typography>
              )}
              {providerHealth.message && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {providerHealth.message}
                </Typography>
              )}
            </Paper>
          </Grid>
        );
      })}
      </Grid>
    </AuthGuard>
  );
}

