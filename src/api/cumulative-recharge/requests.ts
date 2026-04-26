import { axiosInstance } from '../axios';
import type {
  CumulativeGiftEntry,
  CumulativeMilestoneAdmin,
  CumulativeRechargeStateResponse,
} from './types';

export const getCumulativeRechargeState = async (): Promise<CumulativeRechargeStateResponse> => {
  const { data } = await axiosInstance.get<CumulativeRechargeStateResponse>('/cumulative-recharge/state');
  return data;
};

export const claimCumulativeRechargeMilestone = async (payload: {
  milestoneId: string;
  serverId: number;
}): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post<{ message: string }>('/cumulative-recharge/claim', payload);
  return data;
};

export const adminListCumulativeRechargeMilestones = async (): Promise<{ items: CumulativeMilestoneAdmin[] }> => {
  const { data } = await axiosInstance.get<{ items: CumulativeMilestoneAdmin[] }>(
    '/admin/cumulative-recharge/milestones'
  );
  return data;
};

export const adminCreateCumulativeRechargeMilestone = async (payload: {
  thresholdAmount: number;
  title?: string | null;
  gifts: CumulativeGiftEntry[];
  sortOrder?: number;
  isActive?: boolean;
}): Promise<CumulativeMilestoneAdmin> => {
  const { data } = await axiosInstance.post<CumulativeMilestoneAdmin>('/admin/cumulative-recharge/milestones', payload);
  return data;
};

export const adminUpdateCumulativeRechargeMilestone = async (
  id: string,
  payload: {
    thresholdAmount?: number;
    title?: string | null;
    gifts?: CumulativeGiftEntry[];
    sortOrder?: number;
    isActive?: boolean;
  }
): Promise<CumulativeMilestoneAdmin> => {
  const { data } = await axiosInstance.patch<CumulativeMilestoneAdmin>(
    `/admin/cumulative-recharge/milestones/${encodeURIComponent(id)}`,
    payload
  );
  return data;
};

export const adminDeleteCumulativeRechargeMilestone = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/cumulative-recharge/milestones/${encodeURIComponent(id)}`);
};
