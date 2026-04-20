import { useMutation, useQuery } from '@tanstack/react-query';
import { createGiftCodes, getGiftCodeBatchCodes, getGiftCodeBatches, getGiftCodeItems, redeemGiftCode } from './requests';

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
    queryFn: getGiftCodeBatches,
  });
};
