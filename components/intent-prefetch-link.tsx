"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

export function IntentPrefetchLink({
  href,
  children,
  className,
}: {
  href: Route;
  children: React.ReactNode;
  className?: string;
}) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      href={href}
      prefetch={intent ? true : undefined}
      onPointerEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
      className={className}
    >
      {children}
    </Link>
  );
}
