import * as React from 'react';

import { Separator as BaseSeparator } from '@base-ui-components/react';

import { cn } from './utils';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof BaseSeparator.Root>) {
  return (
    <BaseSeparator.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
