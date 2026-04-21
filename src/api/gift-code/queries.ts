import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createGiftCodes,
  deleteGiftCodeBatch,
  getGiftCodeBatchCodes,
  getGiftCodeBatches,
  getGiftCodeItems,
  redeemGiftCode,
  updateGiftCodeBatch,
} from './requests';

export const useCreateGiftCodesMutation = () => {
  return useMutation({
    mutationFn: createGiftCodes,
  });
};

export const useRedeemGiftCodeMutation = () => {
  return useMutation({
    mutationFn: redeemGiftCode,
  });
};

export const useGiftCodeItems = () => {
  return useQuery({
    queryKey: ['gift-code-items'],
    queryFn: getGiftCodeItems,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useGiftCodeBatches = () => {
  return useQuery({
    queryKey: ['gift-code-batches'],
    queryFn: () => getGiftCodeBatches({ page: 1, limit: 10 }),
  });
};

export const useGiftCodeBatchesPaginated = (variables: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['gift-code-batches', variables],
    queryFn: () => getGiftCodeBatches(variables),
  });
};

export const useUpdateGiftCodeBatchMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updateGiftCodeBatch(id, payload),
  });
};

export const useDeleteGiftCodeBatchMutation = () => {
  return useMutation({
    mutationFn: (id: number) => deleteGiftCodeBatch(id),
  });
};
