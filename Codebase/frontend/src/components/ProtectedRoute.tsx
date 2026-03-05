import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  requireTeam?: boolean;
  allowedRoles?: Array<'admin' | 'client' | 'team_member'>;
}

export function ProtectedRoute({ requireAdmin = false, requireTeam = false, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isTeamMember, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    const redirect = isAdmin ? '/admin' : isTeamMember ? '/team' : '/client';
    return <Navigate to={redirect} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={isTeamMember ? '/team' : '/client'} replace />;
  }

  if (requireTeam && !isTeamMember && !isAdmin) {
    return <Navigate to="/client" replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { user, isLoading, isAdmin, isTeamMember } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    const redirect = isAdmin ? '/admin' : isTeamMember ? '/team' : '/client';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
