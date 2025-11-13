'use client';

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Grid,
  Button,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Order } from '../../lib/api/orders';
import { RiskScoreBadge } from './risk-score-badge';
import { OrderTimeline } from './order-timeline';

interface OrderDetailDrawerProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function OrderDetailDrawer({
  order,
  open,
  onClose,
  onConfirm,
  onCancel,
}: OrderDetailDrawerProps) {
  const statusColors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
    pending: 'warning',
    confirmed: 'success',
    unconfirmed: 'error',
    canceled: 'default',
    fulfilled: 'primary',
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 600 } } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Order Details
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Order ID
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {order.platformOrderId}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={order.status}
              color={statusColors[order.status] || 'default'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {order.currency} {order.amount}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Payment Mode
            </Typography>
            <Chip
              label={order.paymentMode.toUpperCase()}
              color={order.paymentMode === 'cod' ? 'warning' : 'success'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Risk Score
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <RiskScoreBadge score={order.riskScore} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Customer Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {order.customer?.name && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{order.customer.name}</Typography>
            </Grid>
          )}
          {(order.email || order.customer?.email) && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{order.email || order.customer?.email}</Typography>
            </Grid>
          )}
          {(order.phone || order.customer?.phone) && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">{order.phone || order.customer?.phone}</Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Timeline
        </Typography>
        <OrderTimeline order={order} />

        {order.status === 'pending' && (onConfirm || onCancel) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2}>
              {onConfirm && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onConfirm(order.id)}
                  fullWidth
                >
                  Confirm Order
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => onCancel(order.id)}
                  fullWidth
                >
                  Cancel Order
                </Button>
              )}
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
}

