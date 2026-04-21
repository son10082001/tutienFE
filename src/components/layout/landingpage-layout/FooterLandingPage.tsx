import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const FooterLandingPage = () => {
  const router = useRouter();

  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/auth');

  const handleEmailClick = () => {
    window.open('mailto:info@valorfantasy.io', '_blank');
  };
  return (
    <>
      <footer className={`border-white/40 border-t bg-[#0C111D] pb-[40px] sm:pb-0`}>
        <div className='mx-auto mt-6 flex flex-col items-center sm:mt-[18px]'>
          <Image
            src='/images/logo-header.png'
            alt='logo'
            width={100}
            height={100}
            className='h-[80px] w-auto cursor-pointer sm:h-[135px]'
            onClick={() => router.push('/')}
          />

          <p
            className='mt-3 cursor-pointer text-button-lg text-white transition-all hover:scale-110'
            onClick={handleEmailClick}
          >
            info@tutien.io
          </p>
        </div>
        <p className='mt-2 border-t border-t-white/40 py-[10px] text-center text-[#E2E8F0] text-caption sm:text-body-1'>
          Copyright © 2025 tutien. All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default FooterLandingPage;
