'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { PolicyRule } from '../../lib/api/policies';
import { ConditionBuilder } from './condition-builder';
import { ActionSelector } from './action-selector';

interface PolicyBuilderProps {
  rules: PolicyRule[];
  onChange: (rules: PolicyRule[]) => void;
}

export function PolicyBuilder({ rules, onChange }: PolicyBuilderProps) {
  const addRule = () => {
    onChange([
      ...rules,
      {
        key: 'riskScore',
        operator: 'greater_than',
        value: 70,
        effect: 'cancel',
      },
    ]);
  };

  const updateRule = (index: number, rule: PolicyRule) => {
    const newRules = [...rules];
    newRules[index] = rule;
    onChange(newRules);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Policy Rules</Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addRule}>
          Add Rule
        </Button>
      </Stack>

      {rules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No rules defined. Add your first rule to get started.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={addRule}>
            Add First Rule
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {rules.map((rule, index) => (
            <Card key={index}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          IF
                        </Typography>
                        <ConditionBuilder
                          rule={rule}
                          onChange={(updatedRule) => updateRule(index, updatedRule)}
                        />
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          THEN
                        </Typography>
                        <ActionSelector
                          value={rule.effect}
                          onChange={(effect) => updateRule(index, { ...rule, effect })}
                        />
                      </Box>
                    </Stack>
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => removeRule(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

