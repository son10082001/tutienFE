'use client';

import { Spinner, forwardRef } from '@heroui/react';
import type { ComponentProps, ReactNode } from 'react';

import { type VariantProps, tv } from 'tailwind-variants';

const buttonVariant = tv({
  base: 'inline-flex min-h-0 text-white cursor-pointer items-center justify-center text-base font-medium outline-none transition-all focus:outline-none disabled:cursor-not-allowed active:scale-85 scale-100 duration-400',
  variants: {
    variant: {
      solid:
        'btn-primary disabled:text-opacity-disabled disabled:border-transparent disabled:bg-opacity-disabled rounded-full',
      secondary:
        'btn-secondary disabled:text-opacity-disabled disabled:border-transparent disabled:bg-opacity-disabled',
      white: 'bg-white  disabled:text-opacity-disabled disabled:border-transparent disabled:bg-opacity-disabled',
      outline:
        'bg-transparent border border-white disabled:text-opacity-disabled disabled:border-transparent disabled:bg-opacity-disabled',
      text: 'disabled:text-opacity-disabled',
    },
    size: {
      none: 'gap-xs text-sm',
      xs: 'gap-xs p-2 h-8 text-sm',
      sm: 'gap-xs p-2 h-9 text-sm',
      md: 'gap-xs h-10 px-3.5 py-2.5 text-sm',
      lg: 'gap-sm h-12 px-6 py-3.5 text-sm',
    },
    fullWidth: {
      true: 'w-full',
      false: 'w-fit',
    },
    iconOnly: {
      true: 'aspect-square p-0',
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'lg',
    fullWidth: false,
  },
});

interface Props extends ComponentProps<'button'>, VariantProps<typeof buttonVariant> {
  asChild?: boolean;
  loadingIcon?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loadingPlacement?: 'start' | 'end';
  loading?: boolean;
}

const StyledButton = forwardRef<'button', Props>((props, ref) => {
  const {
    className,
    children,
    disabled,
    variant = 'solid',
    fullWidth,
    size,
    iconOnly,
    asChild,
    loading,
    loadingIcon = <Spinner className='h-5 w-5' />,
    loadingPlacement = 'start',
    startIcon,
    endIcon,
    type = 'button',
    ...etc
  } = props;

  return (
    <button
      className={buttonVariant({ variant, iconOnly, fullWidth, size, className })}
      ref={ref}
      disabled={loading || disabled}
      aria-disabled={loading || disabled}
      type={type}
      {...etc}
    >
      {startIcon && !loading && startIcon}
      {loading && loadingPlacement === 'start' && loadingIcon}
      {children}
      {loading && loadingPlacement === 'end' && loadingIcon}
      {endIcon && endIcon}
    </button>
  );
});

StyledButton.displayName = 'StyledButton';

export default StyledButton;
