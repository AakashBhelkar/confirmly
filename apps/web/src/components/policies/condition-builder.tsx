'use client';

import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { PolicyRule } from '../../lib/api/policies';

interface ConditionBuilderProps {
  rule: PolicyRule;
  onChange: (rule: PolicyRule) => void;
}

const FIELD_OPTIONS = [
  { value: 'riskScore', label: 'Risk Score' },
  { value: 'amount', label: 'Order Amount' },
  { value: 'paymentMode', label: 'Payment Mode' },
  { value: 'customerCity', label: 'Customer City' },
  { value: 'orderCount', label: 'Order Count' },
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In' },
];

export function ConditionBuilder({ rule, onChange }: ConditionBuilderProps) {
  const handleKeyChange = (key: string) => {
    onChange({ ...rule, key });
  };

  const handleOperatorChange = (operator: PolicyRule['operator']) => {
    onChange({ ...rule, operator });
  };

  const handleValueChange = (value: string | number | string[]) => {
    onChange({ ...rule, value });
  };

  const renderValueInput = () => {
    if (rule.operator === 'in') {
      return (
        <TextField
          fullWidth
          label="Values (comma-separated)"
          value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
          onChange={(e) => {
            const values = e.target.value.split(',').map((v) => v.trim()).filter(Boolean);
            handleValueChange(values);
          }}
        />
      );
    }

    if (rule.key === 'paymentMode') {
      return (
        <FormControl fullWidth>
          <InputLabel>Value</InputLabel>
          <Select
            value={rule.value}
            label="Value"
            onChange={(e) => handleValueChange(e.target.value)}
          >
            <MenuItem value="cod">COD</MenuItem>
            <MenuItem value="prepaid">Prepaid</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (typeof rule.value === 'number' || rule.key === 'riskScore' || rule.key === 'amount' || rule.key === 'orderCount') {
      return (
        <TextField
          fullWidth
          type="number"
          label="Value"
          value={rule.value}
          onChange={(e) => handleValueChange(Number(e.target.value))}
        />
      );
    }

    return (
      <TextField
        fullWidth
        label="Value"
        value={rule.value}
        onChange={(e) => handleValueChange(e.target.value)}
      />
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Field</InputLabel>
          <Select value={rule.key} label="Field" onChange={(e) => handleKeyChange(e.target.value)}>
            {FIELD_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Operator</InputLabel>
          <Select
            value={rule.operator}
            label="Operator"
            onChange={(e) => handleOperatorChange(e.target.value as PolicyRule['operator'])}
          >
            {OPERATOR_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        {renderValueInput()}
      </Grid>
    </Grid>
  );
}

