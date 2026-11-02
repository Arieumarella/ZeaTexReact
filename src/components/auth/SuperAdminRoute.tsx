import { Navigate } from 'react-router';
import { hasToken } from '../../utils/authStorage';

export default function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem('auth_role');
  if (!hasToken() || role !== 'SUPER_ADMIN') {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
}
