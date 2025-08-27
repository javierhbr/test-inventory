import * as React from 'react';

import { RadioGroup as BaseRadioGroup } from '@base-ui-components/react';
import { CircleIcon } from 'lucide-react';

import { cn } from './utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof BaseRadioGroup.Root>) {
  return (
    <BaseRadioGroup.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof BaseRadioGroup.Item>) {
  return (
    <BaseRadioGroup.Item
      data-slot="radio-group-item"
      className={cn(
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs aspect-square size-4 shrink-0 rounded-full border border-input text-primary outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
        className
      )}
      {...props}
    >
      <BaseRadioGroup.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary" />
      </BaseRadioGroup.Indicator>
    </BaseRadioGroup.Item>
  );
}

export { RadioGroup, RadioGroupItem };
