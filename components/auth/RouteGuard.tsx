import React from 'react';
import { Lock } from 'lucide-react';
import { useUserTier, PermissionTier } from '../../hooks/useUserTier';

interface RouteGuardProps {
  requiredTier: PermissionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Route Guard Component - Protects routes based on user permission tier
 *
 * Usage:
 * <RouteGuard requiredTier="L3">
 *   <ExecutiveCockpit />
 * </RouteGuard>
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  requiredTier,
  children,
  fallback
}) => {
  const disableAuth =
    (typeof window !== 'undefined' && (window as any).__ENV?.NEXT_PUBLIC_DISABLE_AUTH === 'true') ||
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  if (disableAuth) {
    return <>{children}</>;
  }

  const { hasPermission, loading } = useUserTier();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--surface-base)]">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-[var(--surface-border)] border-t-white rounded-full"></div>
          </div>
          <p className="text-gray-500 text-sm font-bold italic tracking-wide">
            Loading permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!hasPermission(requiredTier)) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center h-screen bg-[var(--surface-base)] space-y-6 px-4">
          <div className="text-6xl">
            <Lock size={64} className="text-[var(--color-critical)] opacity-20" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold italic tracking-tight text-white font-bold italic text-white tracking-tight">
              Access Denied
            </h1>
            <p className="text-gray-500 text-sm font-bold italic max-w-md">
              You need{' '}
              <span className="font-bold italic text-white">{requiredTier}</span>
              {' '}permission or higher to access this page.
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg max-w-md">
            <h3 className="text-xs font-bold italic tracking-widest text-gray-500 mb-3">
              Permission Tiers
            </h3>
            <ul className="space-y-2 text-gov-label">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-600">L1 - All Users</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-600">L2 - Coordinators</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-gray-600">L3 - Executives</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-gray-600">L4 - Super Admin</span>
              </li>
            </ul>
          </div>

          <p className="text-caption text-gray-500 font-bold italic mt-4">
            Contact your administrator if you believe this is an error.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
