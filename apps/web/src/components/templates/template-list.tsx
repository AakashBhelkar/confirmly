'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PreviewIcon from '@mui/icons-material/Preview';
import { Template } from '../../lib/api/templates';

interface TemplateListProps {
  templates: Template[];
  loading?: boolean;
  onEdit?: (template: Template) => void;
  onDelete?: (id: string) => void;
  onPreview?: (template: Template) => void;
}

export function TemplateList({ templates, loading, onEdit, onDelete, onPreview }: TemplateListProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: Template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleEdit = () => {
    if (selectedTemplate && onEdit) {
      onEdit(selectedTemplate);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTemplate && onDelete) {
      onDelete(selectedTemplate.id);
    }
    handleMenuClose();
  };

  const handlePreview = () => {
    if (selectedTemplate && onPreview) {
      onPreview(selectedTemplate);
    }
    handleMenuClose();
  };

  const channelColors: Record<string, 'default' | 'primary' | 'success' | 'error'> = {
    whatsapp: 'success',
    sms: 'primary',
    email: 'default',
  };

  const statusColors: Record<string, 'default' | 'success'> = {
    draft: 'default',
    active: 'success',
  };

  if (loading) {
    return <Box>Loading templates...</Box>;
  }

  if (templates.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box>No templates found. Create your first template to get started.</Box>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Variables</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id} hover>
              <TableCell>{template.name}</TableCell>
              <TableCell>
                <Chip
                  label={template.channel}
                  size="small"
                  color={channelColors[template.channel] || 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={template.status}
                  size="small"
                  color={statusColors[template.status] || 'default'}
                />
              </TableCell>
              <TableCell>
                {template.variables && template.variables.length > 0
                  ? template.variables.join(', ')
                  : 'None'}
              </TableCell>
              <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, template)}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {onPreview && <MenuItem onClick={handlePreview}>Preview</MenuItem>}
        {onEdit && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
        {onDelete && <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>}
      </Menu>
    </TableContainer>
  );
}

