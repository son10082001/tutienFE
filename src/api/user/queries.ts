import { createMutation, createQuery } from 'react-query-kit';
import { adminDeleteUser, adminGetUserGameMeta, adminListUsers, adminSendItemMailToUser, patchProfile } from './requests';
import type { AdminSendItemMailPayload } from './types';
import type { UpdateProfileInput } from './types';

export const useUpdateProfile = createMutation({
  mutationFn: (data: UpdateProfileInput) => patchProfile(data),
});

export const useAdminUsers = createQuery<
  Awaited<ReturnType<typeof adminListUsers>>,
  { page?: number; limit?: number; search?: string },
  Error
>({
  primaryKey: 'admin-users',
  queryFn: ({ queryKey: [, variables] }) => adminListUsers(variables.page, variables.limit, variables.search),
});

export const useAdminDeleteUser = createMutation({
  mutationFn: (userId: string) => adminDeleteUser(userId),
});

export const useAdminUserGameMeta = createQuery<
  Awaited<ReturnType<typeof adminGetUserGameMeta>>,
  { userId: string | null },
  Error
>({
  primaryKey: 'admin-user-game-meta',
  queryFn: ({ queryKey: [, variables] }) => adminGetUserGameMeta(variables.userId!),
});

export const useAdminSendItemMail = createMutation({
  mutationFn: ({ userId, payload }: { userId: string; payload: AdminSendItemMailPayload }) =>
    adminSendItemMailToUser(userId, payload),
});
