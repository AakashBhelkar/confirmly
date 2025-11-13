'use client';

import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useState, useCallback } from 'react';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

let toastCallback: ((message: string, severity?: AlertColor) => void) | null = null;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  // Set global callback
  if (typeof window !== 'undefined') {
    (window as any).showToast = showToast;
    toastCallback = showToast;
  }

  return (
    <>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export function useToast() {
  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    if (toastCallback) {
      toastCallback(message, severity);
    } else if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(message, severity);
    }
  }, []);

  return {
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showWarning: (message: string) => showToast(message, 'warning'),
    showInfo: (message: string) => showToast(message, 'info'),
  };
}

