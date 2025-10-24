"use client";
import { ReactNode } from "react";
import { baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "../working_connect_wallet_sample/wagmi.config";
// Note: OnchainKit styles temporarily commented due to PostCSS @property parsing issues
// See: https://github.com/coinbase/onchainkit/issues with Next.js 14 + PostCSS
// TODO: Uncomment when Next.js 15 stable is fully released or PostCSS is updated
// import "@coinbase/onchainkit/styles.css";
import "./globals.css";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>BaseFam - Smart Family Wallet</title>
      </head>
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <OnchainKitProvider
              apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
              chain={baseSepolia}
            >
              {children}
            </OnchainKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
