'use client';

import Image from 'next/image';

import RippleBackground from '@/components/ui/ripple-background';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { getAccessToken } from '@/utils/auth';
import { API_URL, GAME_LAUNCH_URL } from '@/utils/const';
import {
  buildGameLaunchUrlWithHandoff,
  ensurePortalGameHandoffForLaunch,
  readPortalGameHandoff,
} from '@/utils/game-handoff';
import { notifyError } from '@/utils/notify';

const JoinNow = () => {
  const user = useAuthStore((state) => state.user);

  function handlePlayNow() {
    try {
      if (!GAME_LAUNCH_URL) {
        notifyError('Không mở được game', 'Thiếu cấu hình URL mở game.');
        return;
      }
      const portalUserId = user?.userId != null ? String(user.userId) : user?.id != null ? String(user.id) : undefined;
      const token = getAccessToken();
      if (!ensurePortalGameHandoffForLaunch(portalUserId, token, API_URL)) {
        notifyError('Không mở được game', 'Chưa liên kết phiên game với tài khoản web. Vui lòng đăng nhập lại.');
        return;
      }
      const h = readPortalGameHandoff();
      if (!h) {
        notifyError('Không mở được game', 'Vui lòng đăng nhập lại.');
        return;
      }
      const url = buildGameLaunchUrlWithHandoff(GAME_LAUNCH_URL, h.userId, h.password, h.deviceGroupId);
      window.open(url, '_blank');
    } catch {
      notifyError('Không mở được game', 'Vui lòng đăng nhập lại.');
    }
  }

  return (
    <RippleBackground
      image={'/images/lp/bg1.webp'}
      className='relative flex h-dvh md:h-[calc(100dvh-30px)] w-full items-center justify-center xl:max-h-screen'
      intensity={5}
      rippleSize={40}
    >
      <div className='container flex flex-col items-center'>
        <Image src={'/images/logo-header.png'} width={288.48} height={192.27} alt='logo' className='h-[184px] w-auto' />
        <p className='mt-6 mb-3 text-center font-extrabold text-2xl text-yellow-300 uppercase tracking-widest drop-shadow-[0_2px_0_#000] [text-shadow:0_0_10px_rgba(255,200,0,0.8),0_0_20px_rgba(255,150,0,0.6)] md:text-3xl '>
          Ngư Tiên Ký – Thả Câu Một Lần, Ngộ Đạo Ngàn Năm
        </p>

        <button
          onClick={handlePlayNow}
          className={cn(
            'relative h-[60px] w-[180px]',
            'font-bold text-white uppercase tracking-wider',
            'bg-gradient-to-b from-yellow-400 to-orange-500',
            'border-2 border-yellow-200',
            'rounded-xl',
            'shadow-[0_6px_0_#b45309,0_0_20px_rgba(255,200,0,0.6)]',
            'hover:brightness-110',
            'active:translate-y-[4px] active:shadow-[0_2px_0_#b45309]',
            'transition-all duration-150'
          )}
        >
          <span className='relative z-10'>Chơi ngay</span>

          {/* glow effect */}
          <span className='absolute inset-0 rounded-xl bg-yellow-300 opacity-20 blur-md'></span>
        </button>
      </div>
    </RippleBackground>
  );
};

export default JoinNow;
