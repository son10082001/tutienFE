import { createMutation, createQuery } from 'react-query-kit';
import {
  adminCreateCumulativeRechargeMilestone,
  adminDeleteCumulativeRechargeMilestone,
  adminListCumulativeRechargeMilestones,
  adminUpdateCumulativeRechargeMilestone,
  claimCumulativeRechargeMilestone,
  getCumulativeRechargeState,
} from './requests';

export const useCumulativeRechargeState = createQuery({
  primaryKey: 'cumulative-recharge-state',
  queryFn: () => getCumulativeRechargeState(),
});

export const useClaimCumulativeRechargeMilestone = createMutation({
  mutationFn: claimCumulativeRechargeMilestone,
});

export const useAdminCumulativeRechargeMilestones = createQuery({
  primaryKey: 'admin-cumulative-recharge-milestones',
  queryFn: () => adminListCumulativeRechargeMilestones(),
});

export const useAdminCreateCumulativeRechargeMilestone = createMutation({
  mutationFn: adminCreateCumulativeRechargeMilestone,
});

export const useAdminUpdateCumulativeRechargeMilestone = createMutation({
  mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminUpdateCumulativeRechargeMilestone>[1] }) =>
    adminUpdateCumulativeRechargeMilestone(id, data),
});

export const useAdminDeleteCumulativeRechargeMilestone = createMutation({
  mutationFn: adminDeleteCumulativeRechargeMilestone,
});
