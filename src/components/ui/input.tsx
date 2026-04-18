import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const baseInputStyles = [
  'text-foreground !rounded-lg',
  'placeholder:text-shades-0 placeholder:font-light placeholder:text-sm',
  'bg-neutral-10 border border-neutral-30',
  'flex w-full ring-offset-background peer',
  'file:border-0 file:bg-transparent',
  'hover:border-neutral-40',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main focus-visible:border-main',
  'disabled:bg-neutral-20 disabled:text-shades-10 disabled:border-neutral-20 disabled:cursor-not-allowed',
].join(' ');

const inputVariants = cva(baseInputStyles, {
  variants: {
    variant: {
      default: 'rounded-sm px-2',
      'with-icon': 'pl-10 pr-3 rounded-sm',
      white: 'bg-white text-black border-neutral-30 hover:border-neutral-40 focus:border-main',
      error: 'border-error text-error focus:ring-error',
      success: 'border-success text-success focus:ring-success',
    },
    inputSize: {
      small: 'h-9 text-sm',
      medium: 'h-10',
      large: 'h-12 text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    inputSize: 'medium',
  },
});

const iconContainerVariants = cva('absolute left-3 flex items-center justify-center text-shades-0', {
  variants: {
    inputSize: {
      small: '[&>*]:h-4 [&>*]:w-4',
      medium: '[&>*]:h-5 [&>*]:w-5',
      large: '[&>*]:h-6 [&>*]:w-6',
    },
  },
  defaultVariants: {
    inputSize: 'medium',
  },
});

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'>, VariantProps<typeof inputVariants> {
  preIcon?: React.ReactNode;
  wrapperClassName?: string;
  isWhite?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, preIcon, variant, inputSize, wrapperClassName, isWhite = false, ...props }, ref) => {
    const inputVariant = isWhite ? 'white' : preIcon ? 'with-icon' : variant || 'default';

    if (preIcon) {
      return (
        <div className={cn('relative flex w-full items-center', wrapperClassName)}>
          <div className={cn(iconContainerVariants({ inputSize }))}>{preIcon}</div>
          <input
            ref={ref}
            type={type}
            data-slot='input'
            className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        data-slot='input'
        className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
export type { VariantProps };
