'use client';

import { AuthGuard } from '../../src/components/auth/auth-guard';
import { DashboardSidebar } from '../../src/components/layout/dashboard-sidebar';
import { DashboardHeader } from '../../src/components/layout/dashboard-header';
import { Box, useTheme, useMediaQuery } from '@mui/material';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashboardHeader />
      <Box sx={{ display: 'flex', flex: 1, mt: 8 }}>
        <DashboardSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { xs: '100%', md: `calc(100% - 240px)` },
          }}
        >
          <AuthGuard requireAuth>
            {children}
          </AuthGuard>
        </Box>
      </Box>
    </Box>
  );
}

