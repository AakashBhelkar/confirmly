'use client';

import { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { templatesApi } from '../../../lib/api/templates';
import { useToast } from '../../shared/toast';

interface CreateTemplateStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export function CreateTemplateStep({ onNext, onBack, initialData }: CreateTemplateStepProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      channel: initialData?.channel || 'whatsapp',
      name: initialData?.name || 'Order Confirmation',
      content: initialData?.content || 'Hi {{customerName}}, your order #{{orderId}} for ₹{{amount}} is ready to ship. Please confirm: Yes/No',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await templatesApi.createTemplate({
        channel: data.channel,
        name: data.name,
        content: data.content,
        variables: ['customerName', 'orderId', 'amount'],
        status: 'active',
      });
      onNext(data);
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Create your first template
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create a message template for order confirmations. You can edit this later.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Use variables like {'{{customerName}}'}, {'{{orderId}}'}, {'{{amount}}'} in your template.
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
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

          <Controller
            name="content"
            control={control}
            rules={{ required: 'Template content is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label="Template Content"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onBack}>Back</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Continue
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

