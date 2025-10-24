# Quick Start - BaseFam Smart Family Wallet

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and fill in required values:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_CDP_API_KEY=
```

### 3. Start Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests with Vitest |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **APP_IMPLEMENTATION.md** | App architecture and implementation details |
| **FEATURE_SUMMARY.md** | Feature overview |
| **FAMILY_MANAGER_HOOKS_IMPLEMENTATION.md** | Hook system documentation |
| **src/README.md** | SDK documentation |

---

## 🏗️ Tech Stack

### Core Framework
- **Next.js 15** - App Router with React 19
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling

### Web3 & Blockchain
- **Wagmi v2** - React hooks for Ethereum
- **Viem v2** - Low-level Ethereum interactions
- **Coinbase OnchainKit** - Wallet components and utilities

### State & Data
- **TanStack Query v5** - Server state management
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing

---

## 🎯 Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main dashboard page
│   ├── wagmi.config.ts    # Wagmi configuration
│   └── components/        # App-specific components
├── src/                   # SDK and shared code
│   ├── contracts/         # Contract ABIs and helpers
│   ├── hooks/             # Custom React hooks (useFamilyManager)
│   ├── lib/              # Utility functions
│   └── providers/        # Context providers (RootProvider)
├── contract/             # Contract artifacts
└── .env.local           # Environment variables (create from .env.example)
```

---

## 🔧 Path Aliases

TypeScript path aliases are configured for cleaner imports:

```typescript
// Instead of: import { useFamilyManager } from '../../../src/hooks'
import { useFamilyManager } from '@/hooks';

// All available aliases:
import { cn } from '@/lib/utils';
import { RootProvider } from '@/providers/root-provider';
import { familyManagerAbi } from '@/contracts';
```

---

## ✅ Validation

Before deploying, run all checks:
```bash
npm run typecheck  # ✓ TypeScript OK
npm run lint       # ✓ ESLint passes
npm run format     # ✓ Prettier formatting
npm run build      # ✓ Production build succeeds
npm test           # ✓ All tests pass
```

---

## 🐛 Troubleshooting

**Wallet not connecting?**
- Ensure you're on Base Sepolia network
- Check RPC URL in `.env.local`
- Verify contract addresses are set

**TypeScript errors?**
- Run `npm install` to ensure all deps are installed
- Run `npm run typecheck` for detailed errors

**Build fails?**
- Check environment variables are set
- Verify all imports use correct path aliases
- Run `npm run lint` to catch issues

**Styling issues?**
- Ensure Tailwind content paths include your files
- Check `tailwind.config.js` configuration

---

## 📞 Need Help?

1. Check **APP_IMPLEMENTATION.md** for architecture details
2. Read **FEATURE_SUMMARY.md** for feature overview
3. See **src/README.md** for SDK documentation
4. Review **FAMILY_MANAGER_HOOKS_IMPLEMENTATION.md** for hooks usage

---

**Ready to build? Start with `npm run dev` 🚀**
