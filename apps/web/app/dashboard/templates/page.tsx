'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '../../../src/hooks/use-templates';
import { TemplateList } from '../../../src/components/templates/template-list';
import { TemplateEditor } from '../../../src/components/templates/template-editor';
import { TemplatePreview } from '../../../src/components/templates/template-preview';
import { LoadingSpinner } from '../../../src/components/shared/loading';
import { Template, CreateTemplateData, UpdateTemplateData } from '../../../src/lib/api/templates';

export default function TemplatesPage() {
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const filters = channelFilter !== 'all' ? { channel: channelFilter } : undefined;
  const { data, isLoading } = useTemplates(filters);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const templates = data?.data || [];

  const handleCreate = () => {
    setEditingTemplate(null);
    setEditorOpen(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(id);
    }
  };

  const handleSubmit = async (templateData: CreateTemplateData | UpdateTemplateData) => {
    if (editingTemplate) {
      await updateTemplate.mutateAsync({ id: editingTemplate.id, data: templateData as UpdateTemplateData });
    } else {
      await createTemplate.mutateAsync(templateData as CreateTemplateData);
    }
    setEditorOpen(false);
    setEditingTemplate(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Templates
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Create Template
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={channelFilter}
          onChange={(_, newValue) => setChannelFilter(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" value="all" />
          <Tab label="WhatsApp" value="whatsapp" />
          <Tab label="SMS" value="sms" />
          <Tab label="Email" value="email" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {isLoading ? (
          <LoadingSpinner message="Loading templates..." />
        ) : (
          <TemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
          />
        )}
      </Paper>

      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
        <DialogContent>
          <TemplateEditor
            template={editingTemplate || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditorOpen(false);
              setEditingTemplate(null);
            }}
            loading={createTemplate.isPending || updateTemplate.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          {selectedTemplate && <TemplatePreview template={selectedTemplate} />}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

