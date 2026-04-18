'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { cn } from '@/lib/utils';
import type * as React from 'react';
import { Input } from '../ui';
import type { InputProps } from '../ui/input';

export interface TextFieldProps extends Omit<InputProps, 'type' | 'placeholder'> {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  description?: string;
  required?: boolean;
  autoComplete?: string;
  labelClassName?: string;
  errorClassName?: string;
  isWhite?: boolean;
}

export function TextField({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  description,
  required,
  autoComplete,
  labelClassName,
  errorClassName,
  isWhite,
  ...inputProps
}: TextFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn(isWhite && 'text-tx-white data-[error=true]:text-tx-white', labelClassName)}>
            {label} {required && <span className='text-error-base'>*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              {...inputProps}
              autoComplete={autoComplete}
              isWhite={isWhite}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className={errorClassName} />
        </FormItem>
      )}
    />
  );
}

export interface PasswordFieldProps extends Omit<React.ComponentProps<'input'>, 'type' | 'placeholder'> {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  hideIcon?: boolean;
  autoComplete?: string;
  labelClassName?: string;
  errorClassName?: string;
  isWhite?: boolean;
}

export function PasswordField({
  control,
  name,
  label,
  placeholder,
  description,
  required,
  autoComplete,
  labelClassName,
  errorClassName,
  isWhite,
  ...inputProps
}: PasswordFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn(isWhite && 'text-tx-white data-[error=true]:text-tx-white', labelClassName)}>
            {label}
            {required && <span className='text-error-base'>*</span>}
          </FormLabel>
          <FormControl>
            <PasswordInput
              placeholder={placeholder}
              {...field}
              {...inputProps}
              autoComplete={autoComplete}
              isWhite={isWhite}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className={errorClassName} />
        </FormItem>
      )}
    />
  );
}
