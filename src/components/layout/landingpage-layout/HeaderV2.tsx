import Link from 'next/link';
import React from 'react';

import { ROUTE } from '@/types';

import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import MobileHeader from './MobileHeader';
import Profile from './Profile';
import Navbar from './navbar';

interface HeaderProps {
  className?: string;
}

const HeaderV2: React.FC<HeaderProps> = ({ className }) => {
  const isScrollingDown = useScrollDirection();
  const renderLogo = () => (
    <Link href={ROUTE.HOME}>
      <Image src='/images/logo-header.png' alt='Logo' width={80} height={80} />
    </Link>
  );

  const renderDesktopView = () => (
    <>
      <div className='flex items-center gap-3'>
        {renderLogo()}
        <div className='block'>
          <Navbar />
        </div>
      </div>
      <Profile />
    </>
  );

  return (
    <>
      <MobileHeader />
      <header
        className={cn(
          'header-bg container fixed top-8 right-0 left-0 z-[49] hidden h-headerMobile max-w-[1360px] items-center rounded-lg px-8 py-3 text-primary-gray-100 transition-transform duration-300 sm:h-header lg:flex',
          isScrollingDown ? '-translate-y-[120px]' : 'translate-y-0',
          className
        )}
      >
        <div className='flex w-full items-center justify-between'>{renderDesktopView()}</div>
      </header>
    </>
  );
};

export default HeaderV2;
