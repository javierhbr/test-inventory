import * as React from 'react';

import { Menubar as BaseMenubar } from '@base-ui-components/react';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from './utils';

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenubar.Root>) {
  return (
    <BaseMenubar.Root
      data-slot="menubar"
      className={cn(
        'shadow-xs flex h-9 items-center gap-1 rounded-md border bg-background p-1',
        className
      )}
      {...props}
    />
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof BaseMenubar.Menu>) {
  return <BaseMenubar.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof BaseMenubar.Group>) {
  return <BaseMenubar.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof BaseMenubar.Portal>) {
  return <BaseMenubar.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof BaseMenubar.RadioGroup>) {
  return (
    <BaseMenubar.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenubar.Trigger>) {
  return (
    <BaseMenubar.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'outline-hidden flex select-none items-center rounded-sm px-2 py-1 text-sm font-medium focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        className
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof BaseMenubar.Content>) {
  return (
    <MenubarPortal>
      <BaseMenubar.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'origin-(--radix-menubar-content-transform-origin) z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof BaseMenubar.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <BaseMenubar.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "data-[variant=destructive]:*:[svg]:!text-destructive outline-hidden relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof BaseMenubar.CheckboxItem>) {
  return (
    <BaseMenubar.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "rounded-xs outline-hidden relative flex cursor-default select-none items-center gap-2 py-1.5 pl-8 pr-2 text-sm focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <BaseMenubar.ItemIndicator>
          <CheckIcon className="size-4" />
        </BaseMenubar.ItemIndicator>
      </span>
      {children}
    </BaseMenubar.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseMenubar.RadioItem>) {
  return (
    <BaseMenubar.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "rounded-xs outline-hidden relative flex cursor-default select-none items-center gap-2 py-1.5 pl-8 pr-2 text-sm focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <BaseMenubar.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </BaseMenubar.ItemIndicator>
      </span>
      {children}
    </BaseMenubar.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenubar.Label> & {
  inset?: boolean;
}) {
  return (
    <BaseMenubar.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenubar.Separator>) {
  return (
    <BaseMenubar.Separator
      data-slot="menubar-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof BaseMenubar.Sub>) {
  return <BaseMenubar.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof BaseMenubar.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <BaseMenubar.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[inset]:pl-8 data-[state=open]:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </BaseMenubar.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenubar.SubContent>) {
  return (
    <BaseMenubar.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        'origin-(--radix-menubar-content-transform-origin) z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
