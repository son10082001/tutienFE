'use client';

import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Coins, Home, Repeat, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home', href: ROUTES.HOME, icon: Home },
  { label: 'Cửa hàng', href: ROUTES.MARKET_PLACE, icon: Store },
  { label: 'Nạp tiền', href: ROUTES.DEPOSIT, icon: Coins },
  { label: 'Đổi phiếu', href: ROUTES.TICKET_EXCHANGE, icon: Repeat },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === ROUTES.HOME) return pathname === href || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className='fixed right-0 bottom-0 left-0 z-[60] border-t border-white/10 bg-[#0C111D]/95 px-2 py-2 backdrop-blur lg:hidden'>
      <ul className='mx-auto grid max-w-md grid-cols-4 gap-1'>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg px-1 py-2 text-[11px] text-white/70 transition',
                  active ? 'bg-[#44C8F3]/15 text-[#44C8F3]' : 'hover:bg-white/5'
                )}
              >
                <Icon className='mb-1 size-4' />
                <span className='leading-none'>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
