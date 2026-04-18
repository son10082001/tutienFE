import { useMe } from '@/api/auth';
import { AvatarCustom } from '@/components/ui/AvatarCustom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Show } from '@/components/utilities';
import { useLogout } from '@/hooks/useLogout';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTE } from '@/types';
import { API_URL, GAME_LAUNCH_URL } from '@/utils/const';
import {
  buildGameLaunchUrlWithHandoff,
  ensurePortalGameHandoffForLaunch,
  readPortalGameHandoff,
} from '@/utils/game-handoff';
import { getAccessToken } from '@/utils/auth';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';

const Profile = () => {
  const isLogin = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { handleLogout, isPending } = useLogout();
  const { data: me } = useMe({
    enabled: isLogin,
  });

  useEffect(() => {
    if (me) {
      setUser(me);
    }
  }, [me, setUser]);

  return (
    <div className='end-0 flex items-center justify-end gap-3'>
      <Show when={!isLogin}>
        <Link href={ROUTE.LOGIN}>
          <p className='px-[46px] font-montserrat font-semibold text-white'>Đăng nhập</p>
        </Link>
      </Show>
      {isLogin && (
        <p className='hidden max-w-[180px] truncate font-montserrat font-semibold text-sm text-white sm:block'>{user?.name || user?.userId}</p>
      )}

      <Show when={isLogin}>
        <Popover>
          <PopoverTrigger asChild>
            <button type='button' className='flex items-center gap-1 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white'>
              <AvatarCustom src='/images/avatar.png' />
              <ChevronDown className='hidden size-4 sm:block' />
            </button>
          </PopoverTrigger>
          <PopoverContent align='end' className='w-56 border-white/10 bg-[#141826] p-3 text-white'>
            <div className='mb-3 border-white/10 border-b pb-3'>
              <p className='truncate font-semibold text-sm'>{user?.name || user?.userId}</p>
              <p className='mt-1 text-xs text-zinc-400'>Role: {user?.role || 'USER'}</p>
            </div>
            {GAME_LAUNCH_URL ? (
              <Button
                type='button'
                variant='secondary'
                className='mb-2 h-9 w-full rounded-md border border-white/20 bg-white/10 font-medium text-white hover:bg-white/20'
                onClick={() => {
                  try {
                    const portalUserId =
                      user?.userId != null ? String(user.userId) : user?.id != null ? String(user.id) : undefined;
                    const token = getAccessToken();
                    if (!ensurePortalGameHandoffForLaunch(portalUserId, token, API_URL)) {
                      toast.error('Chưa liên kết được phiên game với tài khoản web. Vui lòng đăng nhập lại.');
                      return;
                    }
                    const h = readPortalGameHandoff();
                    if (!h) {
                      toast.error('Không mở được game. Vui lòng đăng nhập lại.');
                      return;
                    }
                    const url = buildGameLaunchUrlWithHandoff(GAME_LAUNCH_URL, h.userId, h.password);
                    window.open(url, '_blank');
                  } catch {
                    toast.error('Không mở được game. Vui lòng đăng nhập lại.');
                  }
                }}
              >
                Vào game
              </Button>
            ) : null}
            <Button
              className='h-9 w-full rounded-md bg-[#44C8F3] font-medium text-black hover:bg-[#44C8F3]/80'
              onClick={handleLogout}
              disabled={isPending}
            >
              Đăng xuất
            </Button>
          </PopoverContent>
        </Popover>
      </Show>
    </div>
  );
};

export default Profile;
