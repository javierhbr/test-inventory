import * as React from 'react';

import { Popover as BasePopover } from '@base-ui-components/react';

import { cn } from './utils';

function Popover({ ...props }: React.ComponentProps<typeof BasePopover.Root>) {
  return <BasePopover.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof BasePopover.Trigger>) {
  return <BasePopover.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align: _align = 'center',
  sideOffset: _sideOffset = 4,
  ...props
}: React.ComponentProps<typeof BasePopover.Popup> & {
  align?: string;
  sideOffset?: number;
}) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={_sideOffset} align={_align as any}>
        <BasePopover.Popup
          data-slot="popover-content"
          className={cn(
            'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md',
            className
          )}
          {...props}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
