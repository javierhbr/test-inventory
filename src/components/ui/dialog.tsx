import * as React from 'react';

import { Dialog } from '@base-ui-components/react/dialog';
import { XIcon } from 'lucide-react';

import { cn } from './utils';

const DialogRoot = Dialog.Root;

function DialogTrigger({
  asChild,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    // Check if the child renders as a button element
    const isButton =
      children.type === 'button' ||
      (typeof children.type === 'object' &&
        children.type &&
        'displayName' in children.type &&
        (children.type as any).displayName === 'Button');

    return (
      <Dialog.Trigger
        data-slot="dialog-trigger"
        nativeButton={isButton}
        render={triggerProps =>
          React.cloneElement(children, {
            ...children.props,
            ...triggerProps,
            className: cn(className, children.props.className),
            ...props,
          })
        }
      />
    );
  }

  return (
    <Dialog.Trigger data-slot="dialog-trigger" className={className} {...props}>
      {children}
    </Dialog.Trigger>
  );
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof Dialog.Portal>) {
  return <Dialog.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Close>) {
  return (
    <Dialog.Close data-slot="dialog-close" className={className} {...props} />
  );
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Backdrop>,
  React.ComponentPropsWithoutRef<typeof Dialog.Backdrop>
>(({ className, ...props }, ref) => (
  <Dialog.Backdrop
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Popup>,
  React.ComponentPropsWithoutRef<typeof Dialog.Popup>
>(({ className, children, ...props }, ref) => (
  <DialogPortal data-slot="dialog-portal">
    <DialogOverlay />
    <Dialog.Popup
      ref={ref}
      data-slot="dialog-content"
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:max-w-lg',
        className
      )}
      {...props}
    >
      {children}
      <Dialog.Close className="rounded-xs focus:outline-hidden absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
        <XIcon />
        <span className="sr-only">Close</span>
      </Dialog.Close>
    </Dialog.Popup>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn('text-lg font-semibold leading-none', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export {
  DialogRoot as Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
