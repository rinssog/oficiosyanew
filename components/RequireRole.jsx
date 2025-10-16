'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function RequireRole({ role = 'CLIENT', children }) {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (role && user.role !== role) {
      // redirigir si el rol no coincide
      if (user.role === 'PROVIDER') router.replace('/providers/dashboard');
      else router.replace('/');
    }
  }, [isReady, user, role, router]);

  if (!isReady) return null;
  if (!user || (role && user.role !== role)) return null;
  return children;
}

