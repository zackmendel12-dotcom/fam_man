"use client";
import { ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia } from "wagmi/chains";
import { Toaster } from "sonner";
import { wagmiConfig } from "../../app/wagmi.config";
import "@coinbase/onchainkit/styles.css";

export function RootProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
          chain={baseSepolia}
        >
          {children}
          <Toaster position="top-right" richColors />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
