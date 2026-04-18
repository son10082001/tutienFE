import { cn } from '@/lib/utils';
import { FileX } from 'lucide-react';
import { VStack } from '../utilities';

type Props = {
  content?: string;
  isTransparent?: boolean;
  className?: string;
  textClassName?: string;
  containerClassName?: string;
};
const NoData = ({
  content = 'Không có dữ liệu',
  isTransparent = false,
  className,
  textClassName,
  containerClassName,
}: Props) => {
  return (
    <div className={cn('flex h-full items-center justify-center', containerClassName)}>
      <VStack align='center'>
        <FileX className={cn('size-18 text-gray-500', isTransparent && 'text-white')} strokeWidth={1} />
        <p className={cn('font-medium text-gray-500 text-sm', isTransparent && 'text-white', textClassName)}>
          {content}
        </p>
      </VStack>
    </div>
  );
};

export default NoData;
