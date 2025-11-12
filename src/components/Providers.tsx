"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import "@/i18n";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
