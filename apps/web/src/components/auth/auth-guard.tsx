'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { Box, CircularProgress } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'owner' | 'admin' | 'member' | 'superadmin';
}

export const AuthGuard = ({ children, requireAuth = true, requiredRole }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push('/login');
      return;
    }

    if (!loading && requireAuth && user && requiredRole) {
      const roleHierarchy: Record<string, number> = {
        member: 1,
        admin: 2,
        owner: 3,
        superadmin: 4,
      };

      const userRole = user.role || 'member';
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
      const userRoleLevel = roleHierarchy[userRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, requireAuth, requiredRole, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect
  }

  if (requireAuth && user && requiredRole) {
    const roleHierarchy: Record<string, number> = {
      member: 1,
      admin: 2,
      owner: 3,
      superadmin: 4,
    };

    const userRole = user.role || 'member';
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    const userRoleLevel = roleHierarchy[userRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
};
