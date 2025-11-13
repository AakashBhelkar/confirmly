'use client';

import { useEffect } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';

export function SuccessStep() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        You're all set!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your Confirmly account is ready. You'll be redirected to your dashboard in a few seconds.
      </Typography>
      <Stack spacing={2} alignItems="center">
        <Button variant="contained" size="large" onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
        <Button variant="outlined" onClick={() => router.push('/dashboard/integrations')}>
          Configure Integrations
        </Button>
      </Stack>
    </Box>
  );
}

