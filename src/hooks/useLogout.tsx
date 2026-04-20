import { signOut } from '@/api/auth';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/auth-store';
import { clearPortalGameHandoff } from '@/utils/game-handoff';
import { onMutateError } from '@/utils/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const accessToken = useAuthStore((state) => state.access_token);
  const queryClient = useQueryClient();

  const { mutate: signOutMutation, isPending } = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      clearPortalGameHandoff();
      logout();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
    onError: onMutateError,
  });

  const handleLogout = async () => {
    if (accessToken) {
      signOutMutation();
    } else {
      clearPortalGameHandoff();
      logout();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    }
  };

  return { handleLogout, isPending };
};
