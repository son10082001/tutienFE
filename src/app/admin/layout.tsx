'use client';

import { useLogout } from '@/hooks/useLogout';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { CreditCard, Gift, LayoutDashboard, LogOut, Menu, Percent, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: 'Người dùng', href: ROUTES.ADMIN_USERS, icon: Users },
  { label: 'Nạp tiền', href: ROUTES.ADMIN_DEPOSIT, icon: CreditCard },
  { label: 'KM nạp tiền', href: ROUTES.ADMIN_DEPOSIT_PROMOTION, icon: Percent },
  { label: 'Gift Code', href: ROUTES.ADMIN_GIFT_CODE, icon: Gift },
];

function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { handleLogout, isPending } = useLogout();
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-[#0C111D] text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header */}
      <div className='flex h-16 items-center justify-between border-b border-white/10 px-4'>
        {!collapsed && (
          <span className='truncate font-bold text-sm tracking-wide text-white/90'>Ngư Tiên Ký Admin</span>
        )}
        <button
          type='button'
          onClick={onToggle}
          className='ml-auto flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white'
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className='border-b border-white/10 px-4 py-4'>
          <p className='truncate font-semibold text-sm text-white'>{user?.name || user?.userId || 'Admin'}</p>
          <p className='mt-0.5 text-xs text-white/40'>Quản trị viên</p>
        </div>
      )}

      {/* Nav */}
      <nav className='flex-1 space-y-1 px-2 py-4'>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#44C8F3]/15 text-[#44C8F3]'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={18} className='shrink-0' />
              {!collapsed && <span className='truncate'>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className='border-t border-white/10 px-2 py-4'>
        <button
          type='button'
          onClick={handleLogout}
          disabled={isPending}
          className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50'
        >
          <LogOut size={18} className='shrink-0' />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className='flex h-screen overflow-hidden bg-[#080C14]'>
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main className='flex-1 overflow-y-auto'>{children}</main>
    </div>
  );
}
