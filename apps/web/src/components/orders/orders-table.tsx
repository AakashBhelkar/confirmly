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
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Order } from '../../lib/api/orders';
import { RiskScoreBadge } from './risk-score-badge';

interface OrdersTableProps {
  orders: Order[];
  loading?: boolean;
  onView?: (order: Order) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

const columns: GridColDef<Order>[] = [
  {
    field: 'platformOrderId',
    headerName: 'Order ID',
    width: 150,
    flex: 1,
  },
  {
    field: 'customer',
    headerName: 'Customer',
    width: 200,
    flex: 1,
    valueGetter: (value, row) => {
      if (row.customer?.name) return row.customer.name;
      if (row.email) return row.email;
      if (row.phone) return row.phone;
      return 'N/A';
    },
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 120,
    valueFormatter: (value, row) => `${row.currency} ${value}`,
  },
  {
    field: 'paymentMode',
    headerName: 'Payment',
    width: 100,
    renderCell: (params) => (
      <Chip
        label={params.value.toUpperCase()}
        size="small"
        color={params.value === 'cod' ? 'warning' : 'success'}
      />
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => {
      const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
        pending: 'warning',
        confirmed: 'success',
        unconfirmed: 'error',
        canceled: 'default',
        fulfilled: 'primary',
      };
      return (
        <Chip
          label={params.value}
          size="small"
          color={colors[params.value] || 'default'}
        />
      );
    },
  },
  {
    field: 'riskScore',
    headerName: 'Risk Score',
    width: 120,
    renderCell: (params) => <RiskScoreBadge score={params.value} />,
  },
  {
    field: 'createdAt',
    headerName: 'Created',
    width: 150,
    valueFormatter: (value) => new Date(value).toLocaleDateString(),
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 150,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<VisibilityIcon />}
        label="View"
        onClick={() => {
          // Handle view
        }}
      />,
      params.row.status === 'pending' && (
        <GridActionsCellItem
          icon={<CheckCircleIcon />}
          label="Confirm"
          onClick={() => {
            // Handle confirm
          }}
        />
      ),
      params.row.status === 'pending' && (
        <GridActionsCellItem
          icon={<CancelIcon />}
          label="Cancel"
          onClick={() => {
            // Handle cancel
          }}
        />
      ),
    ].filter(Boolean) as any,
  },
];

export function OrdersTable({
  orders,
  loading = false,
  onView,
  onConfirm,
  onCancel,
  pagination,
}: OrdersTableProps) {
  const [page, setPage] = useState(pagination?.page || 0);
  const [pageSize, setPageSize] = useState(pagination?.limit || 10);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    pagination?.onPageChange(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    pagination?.onLimitChange(newPageSize);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        rowCount={pagination?.total || orders.length}
        paginationMode={pagination ? 'server' : 'client'}
        disableSelectionOnClick
        autoHeight
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
}

