'use client';

import { Autocomplete, TextField, Chip } from '@mui/material';

const AVAILABLE_VARIABLES = [
  { value: '{{customerName}}', label: 'Customer Name' },
  { value: '{{orderNumber}}', label: 'Order Number' },
  { value: '{{orderAmount}}', label: 'Order Amount' },
  { value: '{{orderDate}}', label: 'Order Date' },
  { value: '{{deliveryDate}}', label: 'Delivery Date' },
  { value: '{{trackingNumber}}', label: 'Tracking Number' },
  { value: '{{storeName}}', label: 'Store Name' },
];

interface VariableAutocompleteProps {
  value: string[];
  onChange: (variables: string[]) => void;
}

export function VariableAutocomplete({ value, onChange }: VariableAutocompleteProps) {
  return (
    <Autocomplete
      multiple
      options={AVAILABLE_VARIABLES}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
      value={value.map((v) => AVAILABLE_VARIABLES.find((av) => av.value === v) || v)}
      onChange={(_, newValue) => {
        onChange(newValue.map((v) => (typeof v === 'string' ? v : v.value)));
      }}
      renderInput={(params) => (
        <TextField {...params} label="Variables" placeholder="Select variables" />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          const label = typeof option === 'string' ? option : option.label;
          return <Chip key={key} label={label} {...tagProps} />;
        })
      }
    />
  );
}

