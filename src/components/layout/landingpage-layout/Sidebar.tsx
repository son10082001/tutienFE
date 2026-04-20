'use client';

import { X } from 'lucide-react';
import Link from 'next/link';

import { AvatarCustom } from '@/components/ui/AvatarCustom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { HStack } from '@/components/utilities';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTE } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  opened: boolean;
  toggle: () => void;
}

const PUBLIC_LINKS = [
  { label: 'Trang chủ', href: ROUTE.HOME },
  { label: 'Cửa hàng', href: ROUTE.MARKET_PLACE },
  { label: 'Chăm sóc khách hàng', href: ROUTE.SUPPORT },
];

const AUTH_LINKS = [
  { label: 'Trang chủ', href: ROUTE.HOME },
  { label: 'Cửa hàng', href: ROUTE.MARKET_PLACE },
  { label: 'Nạp tiền', href: ROUTE.DEPOSIT },
  { label: 'Gift Code', href: ROUTE.GIFT_CODE },
  { label: 'Chăm sóc khách hàng', href: ROUTE.SUPPORT },
];

const Sidebar = ({ opened, toggle }: Props) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const links = isAuthenticated ? AUTH_LINKS : PUBLIC_LINKS;

  return (
    <>
      <HStack spacing={24}>
        <Button variant='ghost' size='mixin' onClick={toggle} className='relative hover:bg-transparent'>
          <div
            className={`${
              opened
                ? 'after:rotate-[135deg] after:top-0 before:top-0 before:rotate-45 bg-transparent'
                : 'before:top-1.5 after:-top-1.5 bg-primary-gray-400'
            } h-0.5 w-6 transition-all duration-300 before:transition-all
            before:duration-300 after:transition-all
            after:duration-300 before:w-6 before:h-0.5  before:bg-primary-gray-400 before:right-0 before:absolute after:w-6 after:h-0.5 after:bg-primary-gray-400 after:right-0 after:absolute rounded-md before:rounded-md after:rounded-md`}
          ></div>
        </Button>
      </HStack>

      <Sheet open={opened} onOpenChange={toggle}>
        <SheetContent className='bg-[#0C111D] text-white border-t border-white/50 w-full max-w-full flex flex-col p-0 justify-between'>
          <div>
            <div className='pt-6 pb-4 items-center'>
              <div className='flex justify-between px-4'>
                <HStack spacing={12} align='center'>
                  <AvatarCustom src='/images/avatar.png' />
                  {isAuthenticated && (
                    <div>
                      <p className='font-semibold text-sm text-white'>{user?.name || user?.userId}</p>
                      <p className='text-xs text-white/40'>Đã đăng nhập</p>
                    </div>
                  )}
                </HStack>
                <button type='button' onClick={() => toggle()}>
                  <X width={20} height={20} />
                </button>
              </div>
            </div>

            <div className='h-px bg-white/10' />

            <div className='p-4 flex flex-col'>
              {links.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className='py-3 text-regular font-medium text-white/80 hover:text-white transition-colors'
                  onClick={() => toggle()}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className='h-px bg-white/10' />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  rightElement?: React.ReactNode;
};

const MenuItem = ({ icon, label, isActive, onClick, rightElement }: MenuItemProps) => (
  <div
    role='menuitem'
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    className={cn(
      'py-[.5625rem] px-2.5 flex items-center gap-2 rounded-[.375rem] hover:bg-primary-gray-600 justify-between cursor-pointer',
      {
        'bg-primary-gray-600': isActive,
      }
    )}
  >
    <div className='flex gap-2 items-center'>
      {icon}
      <p className='text-small font-medium text-primary-gray-25'>{label}</p>
    </div>
    {rightElement}
  </div>
);

export { MenuItem };
