import { cn } from '@/lib/utils';

import { LoadingIcon } from './button';

interface Props {
  src?: string;
  className?: string;
  isLoading?: boolean;
  alt?: string;
}
export const AvatarCustom = ({ src, className, isLoading, alt = 'User avatar' }: Props) => {
  return isLoading ? (
    <LoadingIcon className={cn('w-9 aspect-square rounded-full', className)} />
  ) : (
    <img src={src ?? '/images/avatar.png'} className={cn('w-9 aspect-square rounded-full', className)} alt={alt} />
  );
};
