import * as React from 'react';

import { ToggleGroup as BaseToggleGroup } from '@base-ui-components/react';
import { type VariantProps } from 'class-variance-authority';

import { toggleVariants } from './toggle';
import { cn } from './utils';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof BaseToggleGroup.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <BaseToggleGroup.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        'group/toggle-group data-[variant=outline]:shadow-xs flex w-fit items-center rounded-md',
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </BaseToggleGroup.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof BaseToggleGroup.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <BaseToggleGroup.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
        className
      )}
      {...props}
    >
      {children}
    </BaseToggleGroup.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
