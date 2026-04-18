import type { NextPageWithLayout } from '@/types';

import Divider from './components/divider';
import JoinNow from './components/join-now';

const HomePage: NextPageWithLayout = () => {
  return (
    <div className='bg-black'>
      <JoinNow />
      <Divider className='w-full' />
    </div>
  );
};

export default HomePage;
