import { useDisclosure } from '@mantine/hooks';

import { ROUTE } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import Profile from './Profile';
import Sidebar from './Sidebar';

export default function MobileHeader() {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <header className='fixed top-0 z-50 flex w-full items-center justify-between bg-[#0C111D] p-4 lg:hidden'>
      <div className='flex items-center gap-3'>
      <Link href={ROUTE.HOME}>
        <Image src='/images/logo-header.png' alt='Logo' width={100} height={50} />
        </Link>
      </div>
      <div className='flex items-center gap-4'>
        <Profile />
        <Sidebar opened={opened} toggle={toggle} />
      </div>
    </header>
  );
}
