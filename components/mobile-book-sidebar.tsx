'use client';

import * as Ariakit from '@ariakit/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

const MobileBookSidebarContext = createContext<Ariakit.DialogStore | null>(null);

export function MobileBookSidebar({ children, sidebar }: { children: ReactNode; sidebar: ReactNode }) {
  const store = Ariakit.useDialogStore();

  return (
    <MobileBookSidebarContext.Provider value={store}>
      {children}
      <Ariakit.Dialog
        backdrop={
          <div
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
            style={{ viewTransitionName: 'mobile-sidebar-backdrop' }}
          />
        }
        className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] max-w-full touch-pan-y flex-col overflow-x-hidden border-r pt-[max(1rem,env(safe-area-inset-top))] pr-4 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] shadow-2xl outline-none md:hidden"
        hideOnInteractOutside
        onClick={event => {
          if ((event.target as HTMLElement).closest('a[href]')) store.hide();
        }}
        store={store}
        style={{ viewTransitionName: 'mobile-sidebar' }}
        unmountOnHide
      >
        <Ariakit.DialogHeading className="sr-only">Book filters</Ariakit.DialogHeading>
        <Ariakit.DialogDismiss
          aria-label="Close filters"
          className="text-muted hover:bg-card focus-visible:ring-accent dark:hover:bg-card-dark absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 grid size-9 place-items-center rounded-md hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white"
        >
          <X className="size-5" />
        </Ariakit.DialogDismiss>
        {sidebar}
      </Ariakit.Dialog>
    </MobileBookSidebarContext.Provider>
  );
}

export function MobileBookSidebarTrigger() {
  const store = useContext(MobileBookSidebarContext);
  if (!store) return null;

  return (
    <Button
      aria-label="Open filters"
      className="md:hidden"
      render={<Ariakit.DialogDisclosure store={store} />}
      size="icon"
      variant="ghost"
    >
      <SlidersHorizontal className="size-4" />
    </Button>
  );
}
