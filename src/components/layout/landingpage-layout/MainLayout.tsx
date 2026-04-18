import type { ReactNode } from 'react';

import FooterLandingPage from './FooterLandingPage';
import HeaderV2 from './HeaderV2';

interface Props {
  children: ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className='overflow-clip'>
      <HeaderV2 />
      <main className='min-h-screen'>{children}</main>
      <FooterLandingPage />
    </div>
  );
};

export default MainLayout;
