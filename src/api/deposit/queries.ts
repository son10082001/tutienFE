import { createQuery, createMutation } from 'react-query-kit';
import {
  adminApproveDeposit,
  adminCreateDepositPromotion,
  adminGetAllDeposits,
  adminListDepositPromotions,
  adminPatchDepositPromotion,
  adminRejectDeposit,
  adminUpdateDeposit,
  createDepositRequest,
  getDepositPromotion,
  getMyDeposits,
} from './requests';
import type {
  CreateDepositPromotionInput,
  DepositPromotionListResponse,
  DepositPromotionResponse,
  UpdateDepositAdminInput,
} from './types';

export const useMyDeposits = createQuery<
  Awaited<ReturnType<typeof getMyDeposits>>,
  { page?: number; limit?: number },
  Error
>({
  primaryKey: 'my-deposits',
  queryFn: ({ queryKey: [, variables] }) =>
    getMyDeposits(variables.page, variables.limit),
});

export const useAdminDeposits = createQuery<
  Awaited<ReturnType<typeof adminGetAllDeposits>>,
  { page?: number; limit?: number; status?: string },
  Error
>({
  primaryKey: 'admin-deposits',
  queryFn: ({ queryKey: [, variables] }) =>
    adminGetAllDeposits(variables.page, variables.limit, variables.status),
});

export const useCreateDeposit = createMutation({
  mutationFn: createDepositRequest,
});

export const useDepositPromotion = createQuery<DepositPromotionResponse, void, Error>({
  primaryKey: 'deposit-promotion',
  queryFn: () => getDepositPromotion(),
});

export const useAdminDepositPromotions = createQuery<DepositPromotionListResponse, void, Error>({
  primaryKey: 'admin-deposit-promotions',
  queryFn: () => adminListDepositPromotions(),
});

export const useAdminCreateDepositPromotion = createMutation({
  mutationFn: (data: CreateDepositPromotionInput) => adminCreateDepositPromotion(data),
});

export const useAdminPatchDepositPromotion = createMutation({
  mutationFn: ({ id, data }: { id: string; data: { isActive?: boolean; label?: string | null } }) =>
    adminPatchDepositPromotion(id, data),
});

export const useApproveDeposit = createMutation({
  mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
    adminApproveDeposit(id, adminNote),
});

export const useRejectDeposit = createMutation({
  mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
    adminRejectDeposit(id, adminNote),
});

export const useUpdateDeposit = createMutation({
  mutationFn: ({ id, data }: { id: string; data: UpdateDepositAdminInput }) =>
    adminUpdateDeposit(id, data),
});
