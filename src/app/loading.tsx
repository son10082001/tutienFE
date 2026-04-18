'use client';
import { motion } from 'framer-motion';
import type { FC } from 'react';
const bars = ['#19C1FF', '#2DC8FF', '#41CFFF', '#55D6FF', '#69DDFF', '#7DE4FF', '#91EBFF', '#A5F2FF'];

interface Props {}

const LoadingAll: FC<Props> = () => {
  return (
    <section className='fixed top-0 left-0 z-[9999999] flex min-h-screen w-full flex-col items-center justify-center bg-background'>
      <div className='mt-10 flex h-10 items-center justify-center gap-1'>
        <Loader />
      </div>
    </section>
  );
};

const Loader = () => {
  return (
    <div className='mt-10 flex h-10 items-center justify-center gap-1'>
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className='w-1 rounded'
          style={{ backgroundColor: bar }}
          initial={{ height: '30%' }}
          animate={{ height: ['30%', '100%', '30%'] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: 'easeIn',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingAll;
