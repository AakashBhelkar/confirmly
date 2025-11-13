'use client';

import { useState } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useOrders, useConfirmOrder, useCancelOrder } from '../../../src/hooks/use-orders';
import { OrdersTable } from '../../../src/components/orders/orders-table';
import { OrderFiltersComponent } from '../../../src/components/orders/order-filters';
import { OrderDetailDrawer } from '../../../src/components/orders/order-detail-drawer';
import { LoadingSpinner } from '../../../src/components/shared/loading';
import { OrderFilters, Order } from '../../../src/lib/api/orders';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({ page: 1, limit: 10 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, error } = useOrders(filters);
  const confirmOrder = useConfirmOrder();
  const cancelOrder = useCancelOrder();

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleConfirm = async (id: string) => {
    await confirmOrder.mutateAsync(id);
  };

  const handleCancel = async (id: string) => {
    await cancelOrder.mutateAsync(id);
  };

  const handleExport = async () => {
    // TODO: Implement export
    console.log('Export orders', filters);
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography color="error">Error loading orders: {(error as any).message}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Orders
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <OrderFiltersComponent
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({ page: 1, limit: 10 })}
        />

        {isLoading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : (
          <OrdersTable
            orders={data?.data || []}
            loading={isLoading}
            onView={handleViewOrder}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            pagination={
              data?.meta
                ? {
                    total: data.meta.total,
                    page: data.meta.page - 1,
                    limit: data.meta.limit,
                    onPageChange: (page) => setFilters({ ...filters, page: page + 1 }),
                    onLimitChange: (limit) => setFilters({ ...filters, limit, page: 1 }),
                  }
                : undefined
            }
          />
        )}
      </Paper>

      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </Container>
  );
}

