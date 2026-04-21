'use client';

import { DropdownNavigation } from '@/components/ui/dropdown-navigation';
import { HStack } from '@/components/utilities';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTE } from '@/types';

const PUBLIC_NAV = [
  { id: 1, label: 'Cửa hàng', url: ROUTE.MARKET_PLACE },
  { id: 2, label: 'Tin tức', url: ROUTE.NEWS },
  { id: 3, label: 'Chăm sóc khách hàng', url: ROUTE.SUPPORT },
];

const AUTH_NAV = [
  { id: 1, label: 'Cửa hàng', url: ROUTE.MARKET_PLACE },
  { id: 2, label: 'Nạp tiền', url: ROUTE.DEPOSIT },
  { id: 3, label: 'Đổi phiếu', url: ROUTE.TICKET_EXCHANGE },
  { id: 4, label: 'Gift Code', url: ROUTE.GIFT_CODE },
  { id: 5, label: 'Hồ sơ', url: ROUTE.PROFILE },
  { id: 6, label: 'Tin tức', url: ROUTE.NEWS },
  { id: 7, label: 'Chăm sóc khách hàng', url: ROUTE.SUPPORT },
];

const Navbar = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navItems = isAuthenticated ? AUTH_NAV : PUBLIC_NAV;

  return (
    <HStack spacing={24}>
      <DropdownNavigation items={navItems} />
    </HStack>
  );
};

export default Navbar;
