'use client';

import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import { Template } from '../../lib/api/templates';

interface TemplatePreviewProps {
  template: Template;
  variables?: Record<string, string>;
}

const DEFAULT_VARIABLES: Record<string, string> = {
  customerName: 'John Doe',
  orderNumber: 'ORD-12345',
  orderAmount: '₹1,500',
  orderDate: '2024-01-15',
  deliveryDate: '2024-01-20',
  trackingNumber: 'TRACK123456',
  storeName: 'My Store',
};

export function TemplatePreview({ template, variables = {} }: TemplatePreviewProps) {
  const mergedVariables = { ...DEFAULT_VARIABLES, ...variables };

  const renderContent = () => {
    let content = template.content;
    Object.entries(mergedVariables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return content;
  };

  const channelColors: Record<string, 'default' | 'primary' | 'success'> = {
    whatsapp: 'success',
    sms: 'primary',
    email: 'default',
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{template.name}</Typography>
          <Chip
            label={template.channel}
            size="small"
            color={channelColors[template.channel] || 'default'}
          />
        </Box>
        <Box
          sx={{
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            minHeight: 100,
            whiteSpace: 'pre-wrap',
          }}
        >
          <Typography variant="body1">{renderContent()}</Typography>
        </Box>
        {template.variables && template.variables.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Variables used:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {template.variables.map((variable) => (
                <Chip key={variable} label={variable} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

