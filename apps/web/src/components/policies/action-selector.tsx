'use client';

import { FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';

interface ActionSelectorProps {
  value: 'confirm' | 'skip' | 'cancel';
  onChange: (value: 'confirm' | 'skip' | 'cancel') => void;
}

const ACTIONS = [
  { value: 'confirm', label: 'Confirm Order', color: 'success' as const },
  { value: 'skip', label: 'Skip Confirmation', color: 'warning' as const },
  { value: 'cancel', label: 'Cancel Order', color: 'error' as const },
];

export function ActionSelector({ value, onChange }: ActionSelectorProps) {
  const selectedAction = ACTIONS.find((a) => a.value === value);

  return (
    <FormControl fullWidth>
      <InputLabel>Action</InputLabel>
      <Select value={value} label="Action" onChange={(e) => onChange(e.target.value as any)}>
        {ACTIONS.map((action) => (
          <MenuItem key={action.value} value={action.value}>
            <Chip
              label={action.label}
              size="small"
              color={action.color}
              sx={{ mr: 1 }}
            />
            {action.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

