import type { ReactNode } from 'react';

import FooterLandingPage from './FooterLandingPage';
import HeaderV2 from './HeaderV2';
import MobileBottomNav from './MobileBottomNav';

interface Props {
  children: ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className='overflow-clip'>
      <HeaderV2 />
      <main className='min-h-screen pb-0'>{children}</main>
      <FooterLandingPage />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
