'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';
import { type DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  isSmall = false,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  isSmall?: boolean;
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-background p-0',
        isSmall ? '[--cell-size:--spacing(7)]' : '[--cell-size:--spacing(9)]',
        String.raw`rtl:**:[.rdp-button_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('flex flex-col md:flex-row relative', defaultClassNames.months),
        month: cn('flex flex-col w-full border-r border-b border-stroke-soft-200 p-3', defaultClassNames.month),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-3 px-[18px] inset-x-0 justify-between h-9',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-6 aria-disabled:opacity-50 select-none text-tx-white z-50 bg-bgc-white !rounded-6 shadow-regular-xsmall p-2 text-tx-sub-600 hover:bg-bgc-weak-50',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-6 aria-disabled:opacity-50 p-0 select-none text-tx-white z-50 bg-bgc-white !rounded-6 shadow-regular-xsmall p-2 text-tx-sub-600 hover:bg-bgc-weak-50',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex items-center bg-bgc-weak-50 rounded-8 justify-center h-9 w-full px-(--cell-size) z-10 text-tx-sub-600 typo-label-small',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'relative border border-input shadow-xs rounded-md [&>select]:max-h-48 [&>select]:overflow-y-auto',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn('absolute bg-popover inset-0 opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : 'rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5',
          defaultClassNames.caption_label
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex pt-2', defaultClassNames.weekdays, isSmall && 'pt-0'),
        weekday: cn(
          'typo-label-small text-tx-soft-400 h-9 flex items-center justify-center uppercase flex-1 font-normal text-[0.8rem] select-none',
          defaultClassNames.weekday
        ),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        week_number_header: cn('select-none w-(--cell-size)', defaultClassNames.week_number_header),
        week_number: cn('text-[0.8rem] select-none text-muted-foreground', defaultClassNames.week_number),
        day: cn(
          'relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-8 [&:last-child[data-selected=true]_button]:rounded-r-8 group/day aspect-square select-none',
          defaultClassNames.day
        ),
        range_start: cn('rounded-l-8 bg-accent', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-8 bg-accent', defaultClassNames.range_end),
        today: cn(
          'text-tx-strong-950 rounded-8 relative data-[selected=true]:rounded-none data-[selected=true]:bg-transparent',
          defaultClassNames.today
        ),
        outside: cn('text-muted-foreground aria-selected:text-muted-foreground', defaultClassNames.outside),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot='calendar' ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />;
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />;
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className='flex size-(--cell-size) items-center justify-center text-center'>{children}</div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant='ghost'
      size='xsmall'
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        // Base day cell
        'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none',

        // Multiple selection highlight
        'data-[selected-single=true]:bg-primary-base data-[selected-single=true]:text-primary-foreground',

        // Multiple mode specific (react-day-picker sets data-selected=true)
        'data-[selected=true]:bg-primary-base data-[selected=true]:text-primary-foreground',

        // Range-related styling (keep for range mode)
        'data-[range-end=true]:rounded-8 data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-8 data-[range-end=true]:bg-primary-base data-[range-middle=true]:bg-primary-alpha-10 data-[range-start=true]:bg-primary-base data-[range-end=true]:text-tx-white data-[range-start=true]:text-tx-white',

        // Focus and hover states
        'hover:bg-primary-alpha-10 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50',

        // Today indicator
        'relative [&>span]:text-xs [&>span]:opacity-70',

        // Disabled and outside days
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',

        defaultClassNames.day,
        className
      )}
      {...props}
    >
      {day.date.getDate()}
      {modifiers.today && (
        <span
          className='-translate-x-1/2 absolute bottom-1 left-1/2 h-1 w-1 rounded-full bg-primary-base'
          aria-hidden='true'
        />
      )}
    </Button>
  );
}

export { Calendar, CalendarDayButton };
