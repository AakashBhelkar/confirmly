'use client';

import { Chip } from '@mui/material';

interface RiskScoreBadgeProps {
  score?: number;
}

export function RiskScoreBadge({ score }: RiskScoreBadgeProps) {
  if (score === undefined || score === null) {
    return <Chip label="N/A" size="small" color="default" />;
  }

  let color: 'error' | 'warning' | 'success' = 'success';
  let label = `${score}`;

  if (score >= 70) {
    color = 'error';
    label = `${score} (High)`;
  } else if (score >= 40) {
    color = 'warning';
    label = `${score} (Medium)`;
  } else {
    color = 'success';
    label = `${score} (Low)`;
  }

  return <Chip label={label} size="small" color={color} />;
}

