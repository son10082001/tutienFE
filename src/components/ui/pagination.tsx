import { ArrowLeftDoubleIcon, ArrowLeftLineIcon, ArrowRightDoubleIcon, ArrowRightLineIcon } from '@/assets/icon';
import { cn } from '@/lib/utils';
import { DOTS, usePagination } from '../../hooks/usePagination';
import { HStack } from '../utilities';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

type Props = {
  onPageChange: (pageNumber: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isWhite?: boolean;
};

const Pagination = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  isWhite = false,
}: Props) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (!paginationRange || paginationRange.length === 0) return null;

  const lastPage = paginationRange[paginationRange.length - 1];
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <HStack className={className} spacing={2} pos='apart'>
      <span className={cn('typo-para-small', isWhite ? 'text-tx-white' : 'text-tx-sub-600')}>
        Page {currentPage} of {totalPages}
      </span>

      <div className='flex items-center gap-2'>
        <button
          className={cn(
            'flex size-8 items-center justify-center',
            currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            isWhite ? 'text-tx-white' : 'text-tx-sub-600'
          )}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ArrowLeftDoubleIcon className={cn('size-3', isWhite ? 'text-tx-white' : 'text-tx-sub-600')} />
        </button>

        <button
          className={cn(
            'flex size-8 items-center justify-center',
            currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          )}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ArrowLeftLineIcon className={cn('size-3', isWhite ? 'text-tx-white' : 'text-tx-sub-600')} />
        </button>

        {paginationRange.map((pageNumber, i) =>
          pageNumber === DOTS ? (
            <Button
              variant='default'
              className={cn('size-8', isWhite ? 'bg-bgc-white/20 text-tx-white backdrop-blur-[9px]' : '')}
              key={`dots-${i}`}
            >
              …
            </Button>
          ) : (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? 'default' : 'default'}
              className={cn(
                'typo-label-small size-8 rounded-8 text-tx-sub-600 hover:bg-bgc-weak-50 hover:text-tx-sub-600',
                isWhite
                  ? pageNumber === currentPage
                    ? 'bg-bgc-white'
                    : 'bg-bgc-white/20 text-tx-white backdrop-blur-[9px]'
                  : ''
              )}
              onClick={() => onPageChange(pageNumber as number)}
            >
              {pageNumber}
            </Button>
          )
        )}

        <button
          className={cn(
            'flex size-8 items-center justify-center',
            currentPage === lastPage ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          )}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          <ArrowRightLineIcon className={cn('size-3', isWhite ? 'text-tx-white' : 'text-tx-sub-600')} />
        </button>
        <button
          className={cn(
            'flex size-8 items-center justify-center',
            currentPage === lastPage ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          )}
          onClick={() => onPageChange(lastPage as number)}
          disabled={currentPage === lastPage}
        >
          <ArrowRightDoubleIcon className={cn('size-3', isWhite ? 'text-tx-white' : 'text-tx-sub-600')} />
        </button>
      </div>
      <Select
        value={String(pageSize)}
        onValueChange={(val) => {
          onPageSizeChange?.(Number(val));
        }}
      >
        <SelectTrigger className='h-8'>
          <SelectValue className='text-tx-sub-600' />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions?.map((item: number) => (
            <SelectItem value={String(item)} key={item}>
              {item} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </HStack>
  );
};

export default Pagination;
