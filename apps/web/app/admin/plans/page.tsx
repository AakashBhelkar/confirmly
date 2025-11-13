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
  Switch,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAdminPlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../../../src/hooks/use-admin';
import { LoadingSpinner } from '../../../src/components/shared/loading';
import { useForm, Controller } from 'react-hook-form';

export default function AdminPlansPage() {
  const { data, isLoading } = useAdminPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const [editDialog, setEditDialog] = useState<{ open: boolean; plan: any | null }>({
    open: false,
    plan: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; planId: string | null }>({
    open: false,
    planId: null,
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      price: 0,
      currency: 'INR',
      limits: {
        ordersPerMonth: 0,
        messagesPerMonth: 0,
      },
      features: [] as string[],
      public: true,
      sort: 0,
    },
  });

  const plans = data?.data || [];

  const handleCreate = () => {
    reset({
      name: '',
      price: 0,
      currency: 'INR',
      limits: {
        ordersPerMonth: 0,
        messagesPerMonth: 0,
      },
      features: [],
      public: true,
      sort: 0,
    });
    setEditDialog({ open: true, plan: null });
  };

  const handleEdit = (plan: any) => {
    reset({
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      limits: plan.limits,
      features: plan.features,
      public: plan.public,
      sort: plan.sort,
    });
    setEditDialog({ open: true, plan });
  };

  const handleSave = (formData: any) => {
    if (editDialog.plan) {
      updatePlan.mutate(
        { id: editDialog.plan.id, data: formData },
        {
          onSuccess: () => {
            setEditDialog({ open: false, plan: null });
          },
        }
      );
    } else {
      createPlan.mutate(formData, {
        onSuccess: () => {
          setEditDialog({ open: false, plan: null });
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleteDialog.planId) {
      deletePlan.mutate(deleteDialog.planId, {
        onSuccess: () => {
          setDeleteDialog({ open: false, planId: null });
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading plans..." />;
  }

  return (
    <AuthGuard requiredRole="superadmin">
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Create Plan
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Orders/Month</TableCell>
                <TableCell>Messages/Month</TableCell>
                <TableCell>Public</TableCell>
                <TableCell>Sort</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No plans found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>
                      {plan.currency} {plan.price}
                    </TableCell>
                    <TableCell>{plan.limits.ordersPerMonth.toLocaleString()}</TableCell>
                    <TableCell>{plan.limits.messagesPerMonth.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={plan.public ? 'Public' : 'Private'} size="small" color={plan.public ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{plan.sort}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(plan)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, planId: plan.id })}
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

      {/* Edit/Create Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, plan: null })}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(handleSave)}>
          <DialogTitle>{editDialog.plan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: 'Price is required', min: 0 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Price"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
                <Controller
                  name="currency"
                  control={control}
                  rules={{ required: 'Currency is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Currency"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="limits.ordersPerMonth"
                  control={control}
                  rules={{ required: 'Orders limit is required', min: 0 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Orders/Month"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
                <Controller
                  name="limits.messagesPerMonth"
                  control={control}
                  rules={{ required: 'Messages limit is required', min: 0 }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Messages/Month"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Controller
                name="public"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Public"
                  />
                )}
              />
              <Controller
                name="sort"
                control={control}
                rules={{ required: 'Sort order is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Sort Order"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, plan: null })}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createPlan.isPending || updatePlan.isPending}>
              {editDialog.plan ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, planId: null })}>
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this plan? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, planId: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deletePlan.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AuthGuard>
  );
}

