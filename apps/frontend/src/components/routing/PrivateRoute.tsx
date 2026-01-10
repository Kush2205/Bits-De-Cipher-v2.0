import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppSelector } from '../../store/hooks';

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, status, initialized } = useAppSelector((state) => state.auth);
  const isLoading = !initialized || status === 'loading';
  const isAuthenticated = Boolean(user);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
