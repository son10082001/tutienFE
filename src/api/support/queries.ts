import { createMutation, createQuery } from 'react-query-kit';
import {
  createAdminSupportChannel,
  createSupportTicket,
  deleteAdminSupportChannel,
  getAdminSupportChannels,
  getMySupportTickets,
  getSupportMeta,
  uploadAdminSupportIcon,
  updateAdminSupportChannel,
} from './requests';

export const useSupportMeta = createQuery({
  primaryKey: 'support-meta',
  queryFn: () => getSupportMeta(),
});

export const useMySupportTickets = createQuery<
  Awaited<ReturnType<typeof getMySupportTickets>>,
  { page?: number; limit?: number },
  Error
>({
  primaryKey: 'my-support-tickets',
  queryFn: ({ queryKey: [, variables] }) => getMySupportTickets(variables.page, variables.limit),
});

export const useCreateSupportTicket = createMutation({
  mutationFn: createSupportTicket,
});

export const useAdminSupportChannels = createQuery({
  primaryKey: 'admin-support-channels',
  queryFn: () => getAdminSupportChannels(),
});

export const useCreateAdminSupportChannel = createMutation({
  mutationFn: createAdminSupportChannel,
});

export const useUpdateAdminSupportChannel = createMutation({
  mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminSupportChannel(id, data),
});

export const useDeleteAdminSupportChannel = createMutation({
  mutationFn: deleteAdminSupportChannel,
});

export const useUploadAdminSupportIcon = createMutation({
  mutationFn: uploadAdminSupportIcon,
});
