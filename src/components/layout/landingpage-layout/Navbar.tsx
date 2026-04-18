import { DropdownNavigation } from '@/components/ui/dropdown-navigation';
import { HStack } from '@/components/utilities';
import { ROUTE } from '@/types';

const Navbar = () => {
  const navItems = [
    {
      id: 2,
      label: 'Cửa hàng',
      url: ROUTE.MARKET_PLACE,
    },
    {
      id: 3,
      label: 'Nạp tiền',
      url: ROUTE.DEPOSIT,
    },
  ];

  return (
    <HStack spacing={24}>
      <DropdownNavigation items={navItems} />
    </HStack>
  );
};

export default Navbar;
