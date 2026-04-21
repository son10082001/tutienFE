'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

interface DateFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
  label?: ReactNode;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  dateFormat?: string;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
  captionLayout?: 'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years';
  onChange?: (date: Date | undefined) => void;
}

const DateField = <T extends FieldValues>({
  name,
  defaultValue,
  control,
  label,
  placeholder = 'Pick a date',
  description,
  required,
  disabled,
  className,
  buttonClassName,
  dateFormat = 'PPP',
  disablePastDates = false,
  disableFutureDates = false,
  minDate,
  maxDate,
  captionLayout = 'dropdown',
  onChange,
}: DateFieldProps<T>) => {
  const getDisabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check past dates
    if (disablePastDates && date < today) {
      return true;
    }

    // Check future dates
    if (disableFutureDates && date > today) {
      return true;
    }

    // Check min date
    if (minDate && date < minDate) {
      return true;
    }

    // Check max date
    if (maxDate && date > maxDate) {
      return true;
    }

    return false;
  };

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <FormLabel>
              {label} {required && <span className='text-error-base'>*</span>}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant='default'
                  disabled={disabled}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground',
                    fieldState.error && 'border-error-base',
                    buttonClassName
                  )}
                >
                  {field.value ? format(new Date(field.value), dateFormat) : <span>{placeholder}</span>}
                  <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={
                  field.value
                    ? Object.prototype.toString.call(field.value) === '[object Date]'
                      ? field.value
                      : new Date(field.value)
                    : undefined
                }
                onSelect={(date) => {
                  field.onChange(date?.toISOString());
                  onChange?.(date?.toISOString() ? new Date(date.toISOString()) : undefined);
                }}
                disabled={getDisabledDates}
                captionLayout={captionLayout}
                initialFocus
                fromYear={1970}
                toYear={2045}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { DateField };
export type { DateFieldProps };

