'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/theme-context';
import { AuthProvider } from '../contexts/auth-context';
import { ToastProvider } from './shared/toast';
import { ErrorBoundary } from './shared/error-boundary';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <CssBaseline />
                {children}
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

