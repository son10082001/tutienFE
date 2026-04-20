import { createMutation, createQuery } from 'react-query-kit';
import { adminDeleteUser, adminListUsers, patchProfile } from './requests';
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
  queryFn: ({ queryKey: [, variables] }) =>
    adminListUsers(variables.page, variables.limit, variables.search),
});

export const useAdminDeleteUser = createMutation({
  mutationFn: (userId: string) => adminDeleteUser(userId),
});
