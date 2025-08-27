import * as React from 'react';

import { Tooltip as BaseTooltip } from '@base-ui-components/react';

import { cn } from './utils';

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Provider>) {
  return (
    <BaseTooltip.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof BaseTooltip.Root>) {
  return (
    <TooltipProvider>
      <BaseTooltip.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof BaseTooltip.Trigger>) {
  return <BaseTooltip.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Content>) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'origin-(--radix-tooltip-content-transform-origin) z-50 w-fit text-balance rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      >
        {children}
        <BaseTooltip.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary" />
      </BaseTooltip.Content>
    </BaseTooltip.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
