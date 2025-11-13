'use client';

import { Box, Container, Typography, Tabs, Tab } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: 'Merchants', path: '/admin/merchants' },
    { label: 'Plans', path: '/admin/plans' },
    { label: 'Provider Health', path: '/admin/health' },
  ];

  const currentTab = tabs.findIndex((tab) => pathname?.startsWith(tab.path));

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Admin Panel
        </Typography>
        <Tabs
          value={currentTab >= 0 ? currentTab : 0}
          onChange={(_, newValue) => router.push(tabs[newValue].path)}
          sx={{ mb: 3 }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.path} label={tab.label} />
          ))}
        </Tabs>
        {children}
      </Box>
    </Container>
  );
}

