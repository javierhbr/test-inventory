import * as React from 'react';

import { Switch as BaseSwitch } from '@base-ui-components/react';

import { cn } from './utils';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      className={cn(
        'data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-input/80 peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        data-slot="switch-thumb"
        className={cn(
          'bg-card dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-card-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0'
        )}
      />
    </BaseSwitch.Root>
  );
}

export { Switch };
