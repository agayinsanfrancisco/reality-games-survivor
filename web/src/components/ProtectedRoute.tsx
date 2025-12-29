import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LoadingTorch } from './LoadingTorch';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-200">
        <LoadingTorch />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
