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

interface DateMultipleFieldProps<T extends FieldValues = FieldValues> {
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
  onChange?: (dates: Date[] | undefined) => void;
}

const DateMultipleField = <T extends FieldValues>({
  name,
  defaultValue,
  control,
  label,
  placeholder = 'Pick dates',
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
}: DateMultipleFieldProps<T>) => {
  const getDisabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (disablePastDates && date < today) return true;
    if (disableFutureDates && date > today) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedDates: Date[] =
          Array.isArray(field.value) && field.value.length ? field.value.map((v: any) => new Date(v)) : [];

        return (
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
                    variant='neutral-stroke'
                    disabled={disabled}
                    className={cn(
                      '!rounded-6 relative h-10 w-full flex-nowrap items-start justify-start gap-1 text-left',
                      !selectedDates.length && 'text-muted-foreground',
                      fieldState.error && 'border-error-base',
                      buttonClassName
                    )}
                  >
                    {selectedDates.length > 0 ? (
                      <div className='mr-5 flex flex-nowrap gap-1 overflow-x-auto'>
                        {groupContinuousDates(selectedDates).map((label, i) => (
                          <span
                            key={i}
                            className='flex-shrink-0 rounded-md border border-border-soft bg-bgc-weak-50 px-2 py-0.5 text-tx-strong-900 text-xs'
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    <CalendarIcon className='absolute right-2 ml-auto h-4 w-4 flex-shrink-0 opacity-50' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='multiple'
                  selected={selectedDates}
                  onSelect={(dates) => {
                    const formatted = dates?.map((d) => d.toISOString()) ?? [];
                    field.onChange(formatted);
                    onChange?.(dates);
                  }}
                  disabled={getDisabledDates}
                  captionLayout={captionLayout}
                  fromYear={1970}
                  toYear={2045}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export { DateMultipleField };
export type { DateMultipleFieldProps };

export const groupContinuousDates = (dates: Date[]): string[] => {
  if (!dates.length) return [];

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const groups: string[] = [];

  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const diff = (current.getTime() - end.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      end = current;
    } else {
      groups.push(
        start.getTime() === end.getTime()
          ? format(start, 'MMM dd, yyyy')
          : `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
      );
      start = end = current;
    }
  }

  groups.push(
    start.getTime() === end.getTime()
      ? format(start, 'MMM dd, yyyy')
      : `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
  );

  return groups;
};
