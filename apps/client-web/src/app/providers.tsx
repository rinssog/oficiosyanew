import { TRPCReactProvider } from "@/trpc/react";
import type { PropsWithChildren } from "react";

export default function AppProviders({ children }: PropsWithChildren) {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
}
