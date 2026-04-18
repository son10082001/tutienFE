import type { ReactNode } from 'react';
import { useId } from 'react';
import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';

interface CheckboxProps<T extends FieldValues = FieldValues> {
  isChecked?: boolean;
  control: Control<T>;
  name: FieldPath<T>;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
  label?: ReactNode;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

const CheckboxField = <T extends FieldValues>({
  control,
  className,
  labelClassName,
  name,
  label,
  disabled,
  required,
  ...props
}: CheckboxProps<T>) => {
  const id = useId();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className={cn('my-3 flex items-center space-x-2', className)}>
            <FormControl>
              <Checkbox id={id} checked={field.value} onCheckedChange={field.onChange} {...props} disabled={disabled} />
            </FormControl>
            {label && (
              <p className={cn('typo-label-small cursor-pointer', labelClassName)}>
                {label} {required && <span className='text-red-500'>*</span>}
              </p>
            )}
          </div>
          <FormMessage className='text-xs' />
        </FormItem>
      )}
    />
  );
};

export { CheckboxField };
