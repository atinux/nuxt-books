'use client';

import { WifiOff } from 'lucide-react';
import { useOffline } from 'next/offline';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// `experimental.useOffline` only reports the state; the surfacing is ours. One
// sticky toast, dismissed on reconnect, so a flaky connection doesn't stack up.
export function OfflineIndicator() {
  const offline = useOffline();
  const toastId = useRef<number | string | undefined>(undefined);

  useEffect(() => {
    if (offline) {
      toastId.current = toast.error("You're offline — reconnecting…", {
        duration: Infinity,
        icon: <WifiOff aria-hidden className="size-4" />,
      });
    } else if (toastId.current !== undefined) {
      toast.dismiss(toastId.current);
      toastId.current = undefined;
    }
  }, [offline]);

  return null;
}
