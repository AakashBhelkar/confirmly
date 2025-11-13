'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Template, CreateTemplateData, UpdateTemplateData } from '../../lib/api/templates';
import { VariableAutocomplete } from './variable-autocomplete';

interface TemplateEditorProps {
  template?: Template;
  onSubmit: (data: CreateTemplateData | UpdateTemplateData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AVAILABLE_VARIABLES = [
  { value: '{{customerName}}', label: 'Customer Name' },
  { value: '{{orderNumber}}', label: 'Order Number' },
  { value: '{{orderAmount}}', label: 'Order Amount' },
  { value: '{{orderDate}}', label: 'Order Date' },
  { value: '{{deliveryDate}}', label: 'Delivery Date' },
  { value: '{{trackingNumber}}', label: 'Tracking Number' },
  { value: '{{storeName}}', label: 'Store Name' },
];

export function TemplateEditor({ template, onSubmit, onCancel, loading }: TemplateEditorProps) {
  const [variables, setVariables] = useState<string[]>(template?.variables || []);
  const [content, setContent] = useState(template?.content || '');

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name: template?.name || '',
      channel: template?.channel || 'whatsapp',
      content: template?.content || '',
      status: template?.status || 'draft',
    },
  });

  const channel = watch('channel');

  useEffect(() => {
    // Extract variables from content
    const regex = /\{\{(\w+)\}\}/g;
    const matches = content.match(regex);
    if (matches) {
      setVariables([...new Set(matches)]);
    }
  }, [content]);

  const handleVariableInsert = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      setContent(newContent);
      setValue('content', newContent);
    }
  };

  const onSubmitForm = (data: any) => {
    onSubmit({
      ...data,
      variables,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Template name is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label="Template Name"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="channel"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Channel</InputLabel>
                <Select {...field} label="Channel">
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Available Variables:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {AVAILABLE_VARIABLES.map((variable) => (
                <Chip
                  key={variable.value}
                  label={variable.label}
                  onClick={() => handleVariableInsert(variable.value)}
                  size="small"
                  variant="outlined"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>
          <Controller
            name="content"
            control={control}
            rules={{ required: 'Template content is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                id="template-content"
                fullWidth
                multiline
                rows={10}
                label="Template Content"
                placeholder="Enter your template content. Use {{variableName}} for variables."
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  field.onChange(e);
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Detected Variables:
            </Typography>
            {variables.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {variables.map((variable) => (
                  <Chip key={variable} label={variable} size="small" />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No variables detected
              </Typography>
            )}
          </Box>
        </Grid>
        {template && (
          <Grid item xs={12} sm={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {template ? 'Update' : 'Create'} Template
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

