import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import { Spinner } from './spinner';

const buttonVariants = cva(
  'inline-flex items-center active:scale-90 justify-center rounded-sm font-medium ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none hover:scale-[1.025]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        primary:
          'bg-primary-brand-600 !text-primary-gray-700 disabled:!bg-primary-gray-400 disabled:!border-primary-gray-200 disabled:!text-primary-gray-600 active:bg-primary-brand-700 ',
        filled: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:bg-primary-gray-400 disabled:!text-primary-gray-500 disabled:border-primary-gray-400',
        secondary:
          'bg-white text-primary-gray-700 border border-primary-gray-300 hover:bg-primary-gray-100 disabled:bg-primary-gray-100 disabled:text-primary-gray-500 disabled:border-primary-gray-200',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        blue: 'bg-primary-brand-600 text-white disabled:bg-primary-gray-100 disabled:border-primary-gray-200 disabled:text-primary-gray-400 active:bg-primary-brand-700 ',
        error:
          'bg-primary-error-600 !text-white disabled:bg-primary-gray-100 disabled:border-primary-gray-200 disabled:text-primary-gray-400 active:bg-primary-error-700 ',
        white:
          'bg-white text-primary-gray-700 border-primary-gray-300 disabled:border-primary-gray-200 disabled:text-primary-gray-400 active:bg-primary-gray-50 ',
        blueSecondary:
          'bg-white text-primary-brand-700 border-primary-brand-300 disabled:border-primary-gray-200 disabled:text-primary-gray-400 active:bg-primary-brand-50 active:border-primary-brand-300 active:text-primary-brand-800  ',
        redSecondary:
          'bg-white text-primary-error-700 border-primary-error-300 disabled:border-primary-gray-200 disabled:text-primary-gray-400 active:bg-primary-error-50 active:border-primary-error-300 active:text-primary-error-800  ',
        ghostBlue:
          'bg-white text-primary-brand-700  disabled:text-primary-gray-400 active:bg-primary-brand-50 active:text-primary-brand-800  ',
        greygGhost: ' text-primary-gray-700  disabled:text-primary-gray-400 active:bg-primary-gray-50 ',
        tertiary: 'bg-transparent border border-primary-error-400 !text-primary-error-400',
        primaryOutline:
          'bg-transparent border !text-primary-brand-500 border-primary-brand-500 w-[111.25px] hover:text-primary-brand-500 hover:bg-primary-brand-50 disabled:bg-primary-gray-400 disabled:!text-primary-gray-500 disabled:border-primary-gray-400',
      },
      rounded: {
        default: 'rounded-sm',
        full: 'rounded-full',
        md: 'rounded-md',
        none: 'rounded-none',
      },
      size: {
        md: 'h-10 px-3 py-2 text-sm font-medium',
        sm: 'h-9 px-6 text-small font-medium',
        xs: 'h-8 px-3 text-tiny font-medium',
        lg: 'h-12 px-3 text-small',
        xl: 'h-[3.75rem] px-[1.375rem] text-small',
        mixin: 'p-0',
        icon: 'h-6 w-6 rounded-full active:scale-100',
      },
    },
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      rounded: 'default',
    },
  }
);
const LoadingIcon = ({ className, size = '1rem' }: { className?: string; size?: string }) => {
  return <Loader size={size} className={cn('animate-spin text-primary-brand-500', className)} />;
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, type = 'button', size, fullWidth, rounded, asChild = false, loading, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        disabled={props.disabled ?? loading}
        className={cn(fullWidth && 'w-full', buttonVariants({ variant, rounded, size, className }))}
        ref={ref}
        type={type}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {children}
            {loading && <Spinner className='ml-4' />}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants, LoadingIcon };
