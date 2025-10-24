# BaseFam Architecture - Next.js 15

## Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 15 App Router                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  app/                                                         │
│  ├── layout.tsx (Server Component)                          │
│  │   ├── Metadata & Viewport exports                        │
│  │   ├── Inter font (next/font/google)                      │
│  │   └── <RootProvider> wrapper                            │
│  │                                                           │
│  ├── page.tsx (Client Component)                           │
│  │   ├── Wallet connection                                  │
│  │   ├── Network detection (Base Sepolia)                   │
│  │   ├── Role detection (parent/child)                      │
│  │   └── Dashboard routing                                  │
│  │                                                           │
│  ├── wagmi.config.ts                                        │
│  │   ├── MetaMask connector                                 │
│  │   ├── Coinbase Wallet connector                          │
│  │   ├── Base Sepolia chain                                 │
│  │   └── SSR-enabled                                        │
│  │                                                           │
│  └── components/                                            │
│      ├── ParentDashboard.tsx                                │
│      ├── ChildView.tsx                                      │
│      ├── TxList.tsx                                         │
│      ├── Notifications.tsx                                  │
│      └── modals/                                            │
│          ├── RegisterChildModal.tsx                         │
│          ├── FundChildModal.tsx                             │
│          ├── SetLimitsModal.tsx                             │
│          ├── PauseChildModal.tsx                            │
│          └── ReclaimModal.tsx                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Provider Hierarchy

```
<html>
  <body>
    <RootProvider>                     (src/providers/root-provider.tsx)
      │
      ├── <WagmiProvider>             (wagmi 2.14.5)
      │   │
      │   └── <QueryClientProvider>   (TanStack Query 5.56.0)
      │       │
      │       └── <OnchainKitProvider> (Coinbase OnchainKit 0.36.4)
      │           │
      │           └── {children}
      │               │
      │               └── app/page.tsx and all routes
      │
      └── <Toaster />                 (Sonner 1.7.1)
    </RootProvider>
  </body>
</html>
```

## SDK Structure (src/)

```
src/
├── providers/
│   └── root-provider.tsx
│       └── Global provider wrapper
│
├── contracts/
│   ├── family_manager.ts
│   │   ├── familyManagerAbi
│   │   ├── usdcAbi
│   │   └── Address helpers
│   └── index.ts
│
├── hooks/
│   ├── use_family_manager.ts
│   │   ├── useRegisterChild()
│   │   ├── useFundChild()
│   │   ├── useSetLimits()
│   │   ├── usePauseChild()
│   │   ├── useReclaimFunds()
│   │   ├── useApproveUSDC()
│   │   └── Read hooks (balances, limits, etc.)
│   └── index.ts
│
├── lib/
│   ├── units.ts
│   │   ├── USDC conversion helpers
│   │   ├── toUsdcAmount()
│   │   ├── fromUsdcAmount()
│   │   ├── formatUsdcAmount()
│   │   └── USDC math operations
│   │
│   ├── address.ts
│   │   ├── getFamilyManagerAddress()
│   │   └── getUsdcAddress()
│   │
│   ├── utils.ts (NEW)
│   │   └── cn() - Tailwind class merger
│   │
│   ├── toast.ts (NEW)
│   │   └── Toast notification helpers
│   │
│   └── index.ts
│
└── index.ts
    └── Re-exports all SDK functionality
```

## Data Flow

```
┌──────────────┐
│   User       │
│  Interaction │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│          React Component                  │
│  (Parent Dashboard / Child View)          │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│     Custom Hook (useFamilyManager)        │
│   - useRegisterChild()                    │
│   - useFundChild()                        │
│   - useSetLimits()                        │
│   - etc.                                  │
└──────┬───────────────────────────────────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Wagmi      │  │  TanStack    │  │    Viem      │
│  useWrite    │  │   Query      │  │  publicClient│
│  useRead     │  │  (caching)   │  │  (read)      │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   Blockchain           │
            │  (Base Sepolia)        │
            │                        │
            │  - FamilyManager       │
            │  - USDC Token          │
            └────────────────────────┘
```

## Configuration Flow

```
Environment Variables (.env.local)
    │
    ├── NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ────────┐
    ├── NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS ──────┤
    ├── NEXT_PUBLIC_USDC_ADDRESS ────────────────┤
    ├── NEXT_PUBLIC_CHAIN_ID ────────────────────┤
    └── NEXT_PUBLIC_CDP_API_KEY ─────────────────┤
                                                  │
                                                  ▼
                                    ┌──────────────────────────┐
                                    │   app/wagmi.config.ts    │
                                    │   - Chain config         │
                                    │   - Connectors           │
                                    │   - Transport            │
                                    └──────────┬───────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────────┐
                                    │  src/providers/          │
                                    │  root-provider.tsx       │
                                    │  - WagmiProvider         │
                                    │  - QueryClientProvider   │
                                    │  - OnchainKitProvider    │
                                    └──────────┬───────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────────┐
                                    │   app/layout.tsx         │
                                    │   <RootProvider>         │
                                    └──────────────────────────┘
```

## Component Communication

```
┌─────────────────────────────────────────────────────────────┐
│                    Parent Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │ Child Cards     │  │ Quick Actions   │  │ Activity   │  │
│  │ - Balance       │  │ - Register      │  │ Feed       │  │
│  │ - Limits        │  │ - Fund          │  │            │  │
│  │ - Status        │  │ - Set Limits    │  │            │  │
│  └────────┬────────┘  └────────┬────────┘  └─────┬──────┘  │
│           │                     │                  │         │
│           └─────────────────────┴──────────────────┘         │
│                                 │                            │
└─────────────────────────────────┼────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌───────────────────────┐   ┌──────────────────────┐
        │   Modals              │   │   Notifications      │
        │   - Register Child    │   │   - Toast messages   │
        │   - Fund Child        │   │   - Status updates   │
        │   - Set Limits        │   │                      │
        │   - Pause             │   └──────────────────────┘
        │   - Reclaim           │
        └───────────────────────┘
```

## State Management

```
┌────────────────────────────────────────────────────────────┐
│                    State Layers                             │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Blockchain State (Single Source of Truth)              │
│     - Contract data (balances, limits, etc.)               │
│     - Managed by Wagmi hooks                               │
│     - Cached by TanStack Query                             │
│                                                              │
│  2. UI State (Local Component State)                       │
│     - Modal open/close                                      │
│     - Form inputs                                           │
│     - Loading indicators                                    │
│     - Managed by React useState                            │
│                                                              │
│  3. Transient State (Notifications)                        │
│     - Toast messages                                        │
│     - Success/error alerts                                  │
│     - Managed by Sonner                                     │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Build & Deploy Pipeline

```
┌──────────────┐
│  Developer   │
│    Code      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  npm run typecheck                   │
│  - TypeScript validation             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  npm run lint                        │
│  - ESLint checks                     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  npm run format                      │
│  - Prettier formatting               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  npm run build                       │
│  - Next.js production build          │
│  - Static page generation            │
│  - Bundle optimization               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Deploy to Vercel                    │
│  - Automatic edge deployment         │
│  - Environment variables             │
│  - Preview deployments               │
└──────────────────────────────────────┘
```

## Technology Stack Layers

```
┌───────────────────────────────────────────────────────────┐
│                     Presentation Layer                     │
│  React 19 + Next.js 15 + Tailwind CSS                     │
│  - Server/Client Components                               │
│  - App Router                                             │
│  - Utility-first styling                                  │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────┴─────────────────────────────────────┐
│                     Business Logic Layer                   │
│  Custom Hooks (useFamilyManager)                          │
│  - Transaction orchestration                              │
│  - State management                                       │
│  - Error handling                                         │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────┴─────────────────────────────────────┐
│                     Data Layer                             │
│  Wagmi + Viem + TanStack Query                            │
│  - Blockchain reads/writes                                │
│  - Data caching                                           │
│  - Request deduplication                                  │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────┴─────────────────────────────────────┐
│                     Blockchain Layer                       │
│  Base Sepolia + Smart Contracts                           │
│  - FamilyManager contract                                 │
│  - USDC token contract                                    │
│  - On-chain events                                        │
└───────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Server vs Client Components
- **Layout**: Server component for metadata and SEO
- **Page**: Client component for wallet interaction
- **Components**: Client components for blockchain interaction

### 2. Provider Architecture
- Single RootProvider for all global providers
- Centralized configuration
- Easy to test and maintain

### 3. Path Aliases
- `@/` maps to `src/`
- Cleaner imports
- Easier refactoring

### 4. State Management
- Blockchain state: Wagmi + TanStack Query
- UI state: React useState
- No global state needed (blockchain is source of truth)

### 5. Styling
- Tailwind CSS for utility-first approach
- `cn()` utility for dynamic classes
- Mobile-first responsive design

### 6. Type Safety
- Strict TypeScript throughout
- Wagmi provides contract type safety
- Viem provides type-safe ABI parsing

## Performance Optimizations

1. **Static Generation**: Pre-render routes at build time
2. **Code Splitting**: Automatic by Next.js App Router
3. **Font Optimization**: next/font/google
4. **Query Caching**: TanStack Query with stale time
5. **Bundle Size**: Tree-shaking with ES modules
6. **Image Optimization**: Next.js Image component (when used)

## Security Considerations

1. **Environment Variables**: NEXT_PUBLIC_ prefix for client-safe vars
2. **Contract Validation**: ABI type checking
3. **Network Gating**: Enforce Base Sepolia
4. **Wallet Permissions**: User-controlled signing
5. **Input Validation**: TypeScript types + runtime checks
6. **No Private Keys**: Client-side wallet only
