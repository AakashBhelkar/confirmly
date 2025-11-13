'use client';

import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { PolicyRule } from '../../lib/api/policies';

interface PolicyPreviewProps {
  rules: PolicyRule[];
}

export function PolicyPreview({ rules }: PolicyPreviewProps) {
  if (rules.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No rules defined</Typography>
      </Box>
    );
  }

  const effectColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
    confirm: 'success',
    skip: 'warning',
    cancel: 'error',
  };

  return (
    <Stack spacing={2}>
      {rules.map((rule, index) => (
        <Paper key={index} sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              Rule {index + 1}:
            </Typography>
            <Typography variant="body1">
              IF <strong>{rule.key}</strong> {rule.operator} <strong>{String(rule.value)}</strong>
            </Typography>
            <Typography variant="body1">THEN</Typography>
            <Chip
              label={rule.effect}
              size="small"
              color={effectColors[rule.effect] || 'default'}
            />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

