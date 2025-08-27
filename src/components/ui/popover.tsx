import * as React from 'react';

import { Popover as BasePopover } from '@base-ui-components/react';

import { cn } from './utils';

function Popover({
  ...props
}: React.ComponentProps<typeof BasePopover.Root>) {
  return <BasePopover.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof BasePopover.Trigger>) {
  return <BasePopover.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof BasePopover.Content>) {
  return (
    <BasePopover.Portal>
      <BasePopover.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'origin-(--radix-popover-content-transform-origin) outline-hidden z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </BasePopover.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof BasePopover.Anchor>) {
  return <BasePopover.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
