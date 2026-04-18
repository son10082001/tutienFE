import Image from 'next/image';
import React, { type ImgHTMLAttributes } from 'react';

interface IProps extends ImgHTMLAttributes<HTMLImageElement> {}

const Divider = ({ ...props }: IProps) => {
  return <Image {...props} width={1440} height={31} src={'/images/lp/divider1.svg'} className='w-full' alt='divider' />;
};

export default Divider;
