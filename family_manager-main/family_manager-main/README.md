# BaseFam - Smart Family Wallet

> On-chain family allowances and spending management powered by Base Sepolia

BaseFam is a Next.js 15 application that enables families to manage allowances, spending limits, and financial education through blockchain technology. Parents can register children, set spending limits, fund wallets with USDC, and monitor on-chain activity in real-time.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your configuration to .env.local
# Then start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Detailed setup and usage guide
- **[APP_IMPLEMENTATION.md](./APP_IMPLEMENTATION.md)** - Architecture overview
- **[FEATURE_SUMMARY.md](./FEATURE_SUMMARY.md)** - Feature details
- **[FAMILY_MANAGER_HOOKS_IMPLEMENTATION.md](./FAMILY_MANAGER_HOOKS_IMPLEMENTATION.md)** - Hooks documentation
- **[src/README.md](./src/README.md)** - SDK documentation

## 🏗️ Tech Stack

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Wagmi v2** + **Viem v2** for Ethereum interactions
- **Coinbase OnchainKit** for wallet components
- **TanStack Query v5** for data fetching
- **Tailwind CSS** for styling
- **Sonner** for toast notifications

## 🔧 Environment Variables

Create a `.env.local` file (see `.env.example`):

```env
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_CDP_API_KEY=
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm test` | Run tests with Vitest |
| `npm run format` | Format code with Prettier |

## 🎯 Features

### For Parents
- Register children and manage family accounts
- Fund child wallets with USDC
- Set daily, weekly, and monthly spending limits
- Configure category-based spending rules
- Pause/unpause child accounts
- Reclaim funds from child accounts
- View real-time activity feed

### For Children
- View allowance and spending limits
- Track spending by category
- See real-time balance updates
- Transaction history

## 🛠️ Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main dashboard
│   ├── wagmi.config.ts    # Wagmi configuration
│   └── components/        # UI components
├── src/                   # SDK and shared code
│   ├── contracts/         # ABIs and contract helpers
│   ├── hooks/             # React hooks (useFamilyManager)
│   ├── lib/              # Utility functions
│   └── providers/        # Context providers
└── contract/             # Contract artifacts
```

## 🔗 Path Aliases

Import from `@/` instead of relative paths:

```typescript
import { useFamilyManager } from '@/hooks';
import { cn } from '@/lib/utils';
import { RootProvider } from '@/providers/root-provider';
```

## 🧪 Development

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test

# Format code
npm run format
```

## 🚢 Deployment

The application is designed to be deployed on Vercel:

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the documentation before submitting PRs.

---

Built with ❤️ for families on [Base](https://base.org)
