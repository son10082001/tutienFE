import type { NextPageWithLayout } from '@/types';

import Divider from './components/divider';
import FeaturedNews from './components/featured-news';
import JoinNow from './components/join-now';

const HomePage: NextPageWithLayout = () => {
  return (
    <div className='bg-black'>
      <JoinNow />
      <Divider className='w-full' />
      <FeaturedNews />
    </div>
  );
};

export default HomePage;
