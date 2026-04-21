import { createQuery } from 'react-query-kit';
import { getAdminDashboardStats } from './requests';

export const useAdminDashboardStats = createQuery({
  primaryKey: 'admin-dashboard-stats',
  queryFn: () => getAdminDashboardStats(),
});
