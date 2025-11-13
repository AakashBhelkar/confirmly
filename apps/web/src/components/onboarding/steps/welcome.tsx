'use client';

import { Box, Typography, Button, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
    'Reduce RTO losses by 60%+',
    'Automated order confirmations',
    'Multi-channel support (WhatsApp, SMS, Email)',
    'AI-powered risk scoring',
    'Real-time analytics',
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
        Let's get you started!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        We'll guide you through setting up Confirmly in just a few steps.
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleIcon color="primary" />
            <Typography variant="body1">{feature}</Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" size="large" onClick={onNext}>
          Get Started
        </Button>
      </Box>
    </Box>
  );
}

