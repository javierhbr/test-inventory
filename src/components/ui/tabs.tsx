import * as React from 'react';

import { Tabs as BaseTabs } from '@base-ui-components/react';

import { cn } from './utils';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Root>) {
  return (
    <BaseTabs.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  // Note: the package exports Tab and Panel names; use Tab for triggers
  return (
    <BaseTabs.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium text-slate-600 ring-offset-background transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:relative data-[state=active]:!z-20 data-[state=active]:!scale-105 data-[state=active]:transform data-[state=active]:!border-2 data-[state=active]:!border-b-0 data-[state=active]:!border-blue-500 data-[state=active]:!bg-white data-[state=active]:!font-bold data-[state=active]:!text-blue-700 data-[state=active]:!shadow-lg data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:!h-1 data-[state=active]:after:rounded-t-sm data-[state=active]:after:!bg-blue-600 data-[state=active]:after:content-[''] [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[state=active]:[&_svg]:!text-blue-700",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Panel>) {
  // The package names the content panel as Panel
  return (
    <BaseTabs.Panel
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
