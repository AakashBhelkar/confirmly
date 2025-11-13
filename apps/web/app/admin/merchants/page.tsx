'use client';

import { useState } from 'react';
import { Typography } from '@mui/material';
import { AuthGuard } from '../../../src/components/auth/auth-guard';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAdminMerchants, useUpdateMerchant, useDeleteMerchant } from '../../../src/hooks/use-admin';
import { LoadingSpinner } from '../../../src/components/shared/loading';
import { useForm, Controller } from 'react-hook-form';

export default function AdminMerchantsPage() {
  const { data, isLoading } = useAdminMerchants();
  const updateMerchant = useUpdateMerchant();
  const deleteMerchant = useDeleteMerchant();
  const [editDialog, setEditDialog] = useState<{ open: boolean; merchant: any }>({
    open: false,
    merchant: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; merchantId: string | null }>({
    open: false,
    merchantId: null,
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      plan: '',
    },
  });

  const merchants = data?.data || [];

  const handleEdit = (merchant: any) => {
    reset({
      name: merchant.name,
      plan: merchant.plan,
    });
    setEditDialog({ open: true, merchant });
  };

  const handleSave = (formData: any) => {
    if (editDialog.merchant) {
      updateMerchant.mutate(
        { id: editDialog.merchant.id, data: formData },
        {
          onSuccess: () => {
            setEditDialog({ open: false, merchant: null });
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (deleteDialog.merchantId) {
      deleteMerchant.mutate(deleteDialog.merchantId, {
        onSuccess: () => {
          setDeleteDialog({ open: false, merchantId: null });
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading merchants..." />;
  }

  return (
    <AuthGuard requiredRole="superadmin">
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {merchants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No merchants found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                merchants.map((merchant) => (
                  <TableRow key={merchant.id} hover>
                    <TableCell>{merchant.name}</TableCell>
                    <TableCell>{merchant.slug}</TableCell>
                    <TableCell>
                      {merchant.owner ? (
                        <Box>
                          <Typography variant="body2">{merchant.owner.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {merchant.owner.email}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No owner
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={merchant.plan} size="small" />
                    </TableCell>
                    <TableCell>{new Date(merchant.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(merchant)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, merchantId: merchant.id })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, merchant: null })} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleSave)}>
          <DialogTitle>Edit Merchant</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Name"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="plan"
                control={control}
                rules={{ required: 'Plan is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Plan"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, merchant: null })}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateMerchant.isPending}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, merchantId: null })}>
        <DialogTitle>Delete Merchant</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this merchant? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, merchantId: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteMerchant.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AuthGuard>
  );
}

