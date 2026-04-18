import { useDisclosure } from '@mantine/hooks';

import Image from 'next/image';
import Profile from './Profile';
import Sidebar from './Sidebar';

export default function MobileHeader() {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <header className='fixed top-0 z-50 flex w-full items-center justify-between bg-[#0C111D] p-4 lg:hidden'>
      <div className='flex items-center gap-3'>
        <Image src='/images/svgs/logo.svg' alt='Logo' width={100} height={100} />
      </div>
      <div className='flex items-center gap-4'>
        <Profile />
        <Sidebar opened={opened} toggle={toggle} />
      </div>
    </header>
  );
}
