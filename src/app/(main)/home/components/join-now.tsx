import Image from 'next/image';

import { cn } from '@/lib/utils';

const JoinNow = () => {
  return (
    <div className="relative flex h-screen max-h-[900px] w-full items-center justify-center bg-[url('/images/lp/bg1.png')] bg-center bg-no-repeat xl:max-h-screen xl:bg-cover">
      <div className='container flex flex-col items-center'>
        <Image src={'/images/logo-header.png'} width={288.48} height={192.27} alt='logo' className='h-[184px] w-auto' />
        <p className='mt-6 mb-3 text-center font-extrabold text-2xl text-yellow-300 uppercase tracking-widest drop-shadow-[0_2px_0_#000] [text-shadow:0_0_10px_rgba(255,200,0,0.8),0_0_20px_rgba(255,150,0,0.6)] md:text-3xl '>
          Ngư Tiên Ký – Thả Câu Một Lần, Ngộ Đạo Ngàn Năm
        </p>

        <button
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
    </div>
  );
};

export default JoinNow;
