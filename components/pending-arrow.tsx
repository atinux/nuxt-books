"use client";

import { useLinkStatus } from "next/link";

export function PendingArrow({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();

  return <span data-pending={pending ? "" : undefined}>{children}</span>;
}
