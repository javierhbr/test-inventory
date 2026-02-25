import * as React from 'react';

import { Tabs as BaseTabs } from '@base-ui-components/react';

import { cn } from './utils';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Root>) {
  // Fallback: periodically enforce inline styles on the active tab element.
  // This queries the document for all tab triggers and applies inline styles
  // to the active one, avoiding ref typing issues with the external Tabs root.
  React.useEffect(() => {
    const interval = setInterval(() => {
      const triggers = Array.from(
        document.querySelectorAll<HTMLElement>("[data-slot='tabs-trigger']")
      );
      for (const t of triggers) {
        const isActive = t.getAttribute('data-state') === 'active';
        if (isActive) {
          t.style.backgroundColor = '#ffffff';
          t.style.color = '#0f172a';
          t.style.fontWeight = '600';
          t.style.boxShadow = '0 1px 3px rgba(2,6,23,0.06)';
          t.style.borderRadius = '9999px';
        } else {
          t.style.backgroundColor = '';
          t.style.color = '';
          t.style.fontWeight = '';
          t.style.boxShadow = '';
          t.style.borderRadius = '';
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

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
        // light gray bar that holds the pills
        'text-muted-foreground inline-flex h-12 items-center rounded-lg bg-slate-100 p-2',
        className
      )}
      {...props}
    />
  );
}

// Use the observer-enabled trigger as the exported TabsTrigger so active
// state changes get a forced CSS class when needed.
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  const elRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const applyActive = (node: HTMLElement) => {
      const state = node.getAttribute('data-state');
      if (state === 'active') {
        node.classList.add('forced-active');
      } else {
        node.classList.remove('forced-active');
      }
    };

    // Initial check
    applyActive(el);

    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (
          m.type === 'attributes' &&
          (m.attributeName === 'data-state' || m.attributeName === 'class')
        ) {
          applyActive(m.target as HTMLElement);
        }
      }
    });

    mo.observe(el, {
      attributes: true,
      attributeFilter: ['data-state', 'class'],
    });

    return () => mo.disconnect();
  }, []);

  return (
    <BaseTabs.Tab
      ref={elRef as React.RefObject<HTMLElement>}
      data-slot="tabs-trigger"
      className={cn(
        // default: transparent on the gray bar, muted text
        'focus-visible:ring-ring relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        // Active state: white pill, darker text, semibold, small shadow
        'data-[state=active]:rounded-full data-[state=active]:!bg-white data-[state=active]:!font-semibold data-[state=active]:!text-slate-900 data-[state=active]:!shadow-sm',
        // SVG sizing helpers
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

// Enhance TabsTrigger: attach a MutationObserver to add a fallback class when
// the underlying library sets data-state="active" at the DOM level. This
// guarantees we can style the active tab even if other CSS overrides Tailwind.
// (removed unused helper) TabsTrigger uses a local ref and mutation observer
// implementation above — no additional helper needed.

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
