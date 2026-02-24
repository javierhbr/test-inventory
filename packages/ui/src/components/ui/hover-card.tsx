import * as React from 'react';

import { PreviewCard as BasePreviewCard } from '@base-ui-components/react';

import { cn } from './utils';

function HoverCard({
  ...props
}: React.ComponentProps<typeof BasePreviewCard.Root>) {
  return <BasePreviewCard.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof BasePreviewCard.Trigger>) {
  return <BasePreviewCard.Trigger data-slot="hover-card-trigger" {...props} />;
}

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: string;
  sideOffset?: number;
}) {
  return (
    <div
      data-slot="hover-card-content"
      className={cn(
        'bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md',
        className
      )}
      {...props}
    />
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
