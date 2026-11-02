import { Navigate } from 'react-router';
import { hasToken, hasEmployeeProfile } from '../../utils/authStorage';

export default function EmployeeRoute({ children }: { children: React.ReactNode }) {
  if (!hasToken() || !hasEmployeeProfile()) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
}
