# BaseFam - Smart Family Wallet

BaseFam is a Next.js 14 App Router dapp written in TypeScript/React 19, styled with Tailwind CSS and powered by Wagmi/Viem, Coinbase OnchainKit, and TanStack React Query for blockchain connectivity and data caching.

> **Note**: This project uses React 19 with Next.js 14.2, which requires `legacy-peer-deps=true` in `.npmrc` since Next.js 14 officially supports React 18. This configuration is temporary until Next.js 15 stable is released with full React 19 support.

## Features

- **Family Wallet Management**: Parent dashboard to manage child accounts with allowance controls
- **Base Sepolia Network**: Built on Base testnet for Ethereum L2 transactions
- **Smart Contract Integration**: Full integration with FamilyManager contract for on-chain role detection and transactions
- **Real-time Activity Feed**: Contract event monitoring for transaction history
- **USDC Support**: Native USDC token support for allowances and spending limits
- **Daily/Weekly/Monthly Limits**: Configurable spending limits with category-based restrictions

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 20.0.0 (recommended: 20.19.5)
- **npm**: >= 10.0.0
- **nvm** (optional but recommended): For Node version management

## Getting Started

### 1. Node Version Setup

This project uses Node.js 20.19.5. If you have [nvm](https://github.com/nvm-sh/nvm) installed, you can automatically use the correct version:

```bash
nvm use
```

If you don't have the specified Node version installed:

```bash
nvm install
```

Alternatively, manually install Node.js 20.19.5 or later from [nodejs.org](https://nodejs.org/).

### 2. Install Dependencies

```bash
npm install
```

The installation uses `legacy-peer-deps=true` to allow React 19 with Next.js 14.2. All dependencies are compatible with React 19.

### 3. Environment Setup

Create a `.env.local` file in the root directory with your environment variables:

```env
# Add your environment variables here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Generate test coverage report

## Technology Stack

### Core Dependencies

- **Next.js 14.2.24**: React framework with App Router
- **React 19.2.0**: UI library with latest features (using legacy-peer-deps)
- **TypeScript 5.8.2**: Type-safe JavaScript
- **Tailwind CSS 3.4+**: Utility-first CSS framework

### Blockchain Integration

- **Coinbase OnchainKit 1.1.1**: Coinbase's on-chain toolkit with React 19 support
- **Wagmi 2.18.0**: React Hooks for Ethereum
- **Viem 2.27.0**: TypeScript interface for Ethereum
- **TanStack React Query 5.56+**: Data fetching and caching

### Development Tools

- **TypeScript**: For type safety
- **ESLint**: Code linting
- **Vitest**: Unit testing framework
- **Autoprefixer**: CSS vendor prefixing
- **PostCSS**: CSS transformations

## Dependency Management Strategy

### Version Pinning

This project uses caret (`^`) ranges for most dependencies, which allows patch and minor updates but prevents major breaking changes. This provides a balance between:

- **Stability**: Major versions are locked to prevent breaking changes
- **Security**: Automatic patch updates for security fixes
- **Features**: Access to new minor version features

### React 19 Compatibility

All dependencies have been carefully selected and updated to support React 19:

- ✅ **@coinbase/onchainkit 1.1.1**: Native React 19 support
- ✅ **Next.js 15.5.6**: Full React 19 compatibility
- ✅ **Wagmi 2.18.0**: React 18+ support (works with 19)
- ✅ **@types/react 19.2.0**: Matching React version types

### Node Version Management

The project requires Node.js 20+ for optimal performance and compatibility:

- `.nvmrc` file specifies Node 20.19.5
- `engines` field in `package.json` enforces Node >= 20.0.0
- `.npmrc` configured with `engine-strict=true` for version enforcement

## Troubleshooting

### Installation Issues

#### Issue: `ERESOLVE` peer dependency errors

**Solution**: This should not occur with the current configuration, but if you encounter peer dependency issues:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Issue: Wrong Node version

**Solution**: Ensure you're using Node 20+:

```bash
node --version  # Should show v20.x.x or higher
nvm use         # If using nvm
```

#### Issue: Permission errors during installation

**Solution**: Don't use `sudo` with npm. Fix npm permissions:

```bash
# Option 1: Use nvm (recommended)
# Install nvm and reinstall Node.js

# Option 2: Configure npm to use a different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

### Build Issues

#### Issue: TypeScript errors after updating

**Solution**: Clear Next.js cache:

```bash
rm -rf .next
npm run build
```

#### Issue: Module resolution errors

**Solution**: Clear all caches and reinstall:

```bash
rm -rf node_modules .next package-lock.json
npm install
```

#### Issue: OnchainKit styles not loading

**Known Issue**: The OnchainKit CSS (`@coinbase/onchainkit/styles.css`) is currently commented out in `app/layout.tsx` due to PostCSS compatibility issues with CSS `@property` at-rules in both Next.js 14 and 15.

**Status**: This is a known limitation with the current Next.js + PostCSS + OnchainKit stack. The core functionality works without the styles, but OnchainKit components may have minimal/unstyled appearance.

**Workarounds**:
1. Wait for Next.js 15 stable release with improved CSS handling
2. Add custom styles for OnchainKit components in your globals.css
3. Use OnchainKit's unstyled components and apply custom styling

**Tracking**: See `app/layout.tsx` for TODO comments and https://github.com/coinbase/onchainkit/issues

### Runtime Issues

#### Issue: Wallet connection failures

**Solution**: Ensure you have:
1. A valid WalletConnect Project ID in `.env.local`
2. MetaMask or compatible wallet installed
3. Connected to Base Sepolia testnet

#### Issue: Contract interaction errors

**Solution**: Verify:
1. You're connected to the correct network (Base Sepolia)
2. Your wallet has sufficient test ETH for gas
3. Contract addresses are correctly configured

## Updating Dependencies

### Safe Update Process

1. **Check for updates**:
   ```bash
   npm outdated
   ```

2. **Update patch versions** (generally safe):
   ```bash
   npm update
   ```

3. **Update specific dependencies**:
   ```bash
   npm install <package>@latest
   ```

4. **Test after updates**:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```

### Major Version Updates

When updating to major versions:

1. **Read the changelog**: Check for breaking changes
2. **Update one at a time**: Don't update multiple major versions at once
3. **Test thoroughly**: Run all tests and manual testing
4. **Check peer dependencies**: Ensure compatibility with other packages

### Recommended Update Schedule

- **Patch updates**: Apply automatically (security fixes)
- **Minor updates**: Review monthly (new features)
- **Major updates**: Review quarterly (breaking changes)

### Critical Dependencies to Watch

Keep these packages aligned:

- **React ecosystem**: `react`, `react-dom`, `@types/react`, `@types/react-dom`
- **Next.js ecosystem**: `next`, `eslint-config-next`
- **Blockchain stack**: `wagmi`, `viem`, `@coinbase/onchainkit`

## Project Structure

```
family_manager-main/
├── contract/           # Smart contract ABIs and interfaces
├── src/               # Source code
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   └── app/           # Next.js App Router pages
├── public/            # Static assets
├── .nvmrc             # Node version specification
├── .npmrc             # npm configuration
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Environment Variables

Required environment variables for the application:

```env
# WalletConnect (required)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=

# OnchainKit API (optional but recommended)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# Network Configuration (optional - defaults to Base Sepolia)
NEXT_PUBLIC_CHAIN_ID=84532

# Contract Addresses (if different from defaults)
NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=
```

## Contributing

When contributing to this project:

1. Ensure you're using the correct Node version (see `.nvmrc`)
2. Run `npm install` to get all dependencies
3. Run `npm run typecheck` and `npm run lint` before committing
4. Follow existing code style and patterns
5. Add tests for new features
6. Update documentation as needed

## Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with:
   - Node version (`node --version`)
   - npm version (`npm --version`)
   - Error messages and stack traces
   - Steps to reproduce

## License

This project is private and not licensed for public use.

---

Built with ❤️ using Next.js, React 19, and Coinbase OnchainKit
