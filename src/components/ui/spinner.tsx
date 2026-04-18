import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

export const Spinner = ({ className, size = '1rem' }: { className?: string; size?: string }) => {
  return <Loader size={size} className={cn('animate-spin ', className)} />;
};
