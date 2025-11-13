'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        gap: 2,
      }}
    >
      <CircularProgress />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}

export function LoadingSkeleton({ height = 200 }: { height?: number }) {
  return (
    <Box
      sx={{
        height,
        width: '100%',
        borderRadius: 1,
        bgcolor: 'grey.200',
        animation: 'pulse 1.5s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
        },
      }}
    />
  );
}

