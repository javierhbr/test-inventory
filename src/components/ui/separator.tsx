import * as React from 'react';

import { cn } from './utils';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}) {
  // Render a simple accessible separator to avoid relying on external library exports
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      data-slot="separator-root"
      data-orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
