import { axiosInstance } from '../axios';
import { normalizeApiMediaUrl } from '../media-url';
import type {
  CumulativeGiftEntry,
  CumulativeMilestoneAdmin,
  CumulativeRechargeStateResponse,
  UploadCumulativeRechargeGiftImageResponse,
} from './types';

function normalizeGiftEntry(gift: CumulativeGiftEntry): CumulativeGiftEntry {
  return {
    ...gift,
    imageUrl: normalizeApiMediaUrl(gift.imageUrl) ?? undefined,
  };
}

function normalizeMilestoneAdmin(item: CumulativeMilestoneAdmin): CumulativeMilestoneAdmin {
  return {
    ...item,
    gifts: Array.isArray(item.gifts) ? item.gifts.map(normalizeGiftEntry) : [],
  };
}

function normalizeStateResponse(data: CumulativeRechargeStateResponse): CumulativeRechargeStateResponse {
  return {
    ...data,
    milestones: Array.isArray(data.milestones)
      ? data.milestones.map((milestone) => ({
          ...milestone,
          gifts: Array.isArray(milestone.gifts) ? milestone.gifts.map(normalizeGiftEntry) : [],
        }))
      : [],
  };
}

export const getCumulativeRechargeState = async (): Promise<CumulativeRechargeStateResponse> => {
  const { data } = await axiosInstance.get<CumulativeRechargeStateResponse>('/cumulative-recharge/state');
  return normalizeStateResponse(data);
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
  return {
    ...data,
    items: Array.isArray(data?.items) ? data.items.map(normalizeMilestoneAdmin) : [],
  };
};

export const adminCreateCumulativeRechargeMilestone = async (payload: {
  thresholdAmount: number;
  title?: string | null;
  gifts: CumulativeGiftEntry[];
  sortOrder?: number;
  isActive?: boolean;
}): Promise<CumulativeMilestoneAdmin> => {
  const { data } = await axiosInstance.post<CumulativeMilestoneAdmin>('/admin/cumulative-recharge/milestones', payload);
  return normalizeMilestoneAdmin(data);
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
  return normalizeMilestoneAdmin(data);
};

export const adminDeleteCumulativeRechargeMilestone = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/cumulative-recharge/milestones/${encodeURIComponent(id)}`);
};

export const adminUploadCumulativeRechargeGiftImage = async (
  file: File
): Promise<UploadCumulativeRechargeGiftImageResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await axiosInstance.post<UploadCumulativeRechargeGiftImageResponse>(
    '/admin/cumulative-recharge/upload-image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return {
    ...data,
    url: normalizeApiMediaUrl(data?.url) ?? '',
  };
};
