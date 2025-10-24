# BaseFam — Smart Family Wallet

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A React-based smart family wallet interface built on Base Sepolia testnet. BaseFam enables parents to manage family finances with subaccounts, spending limits, automated allowances, and transaction monitoring—all powered by USDC on Base.

## 🎯 Features

- **Main Wallet Dashboard**: View total family balance managed by the primary account holder
- **Family Member Management**: Add Mom/Kid roles with customizable spending limits
- **Automated Allowances**: Daily allowance distribution for kids
- **Spending Controls**: Set daily limits (kids) or monthly limits (parents)
- **Transaction History**: Real-time monitoring of all family spending
- **Settings Management**: Update limits, allowances, or revoke member access
- **Mobile-First Design**: Fully responsive UI optimized for all devices

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- A wallet compatible with Base Sepolia (e.g., MetaMask, Coinbase Wallet)
- Base Sepolia testnet ETH for gas fees (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- USDC tokens on Base Sepolia for testing

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Gemini API Key (optional, for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# Base Sepolia RPC URL (for wallet integration)
VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Contract Address (when deployed)
VITE_FAMILY_MANAGER_CONTRACT_ADDRESS=0x...
```

**Environment Variable Descriptions:**

- `GEMINI_API_KEY`: Optional API key for Gemini AI integration features
- `VITE_BASE_SEPOLIA_RPC_URL`: RPC endpoint for Base Sepolia testnet (default: `https://sepolia.base.org`)
- `VITE_FAMILY_MANAGER_CONTRACT_ADDRESS`: Deployed FamilyManager smart contract address on Base Sepolia

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Build artifacts will be output to the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## 🌐 Network Configuration

### Base Sepolia Testnet

- **Chain ID**: 84532
- **RPC URL**: `https://sepolia.base.org`
- **Block Explorer**: https://sepolia.basescan.org
- **Currency**: ETH (for gas)
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### USDC Token Details

- **Token**: USDC (USD Coin)
- **Decimals**: **6** (not 18 like ETH)
- **Important**: When working with USDC amounts:
  - Display value: `amount / 1e6` (divide by 1,000,000)
  - Contract value: `amount * 1e6` (multiply by 1,000,000)
  - Example: $10.50 USDC = `10500000` in contract units

⚠️ **Critical**: Always remember USDC uses 6 decimals. Incorrect decimal handling will result in transaction errors or incorrect amounts.

## 👛 Wallet Connection & Testing

### Setting Up Your Wallet

1. **Install a Web3 Wallet**:
   - [MetaMask](https://metamask.io/) browser extension
   - [Coinbase Wallet](https://www.coinbase.com/wallet) browser extension

2. **Add Base Sepolia Network**:
   - Open your wallet settings
   - Add custom network with the details above
   - Or use [Chainlist](https://chainlist.org/) to add automatically

3. **Get Test Funds**:
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Request testnet ETH to your wallet address
   - Use a USDC faucet or testnet bridge to get test USDC

### Testing Flows

**Parent Account Flow**:
1. Connect wallet as the primary account holder (Father role)
2. View main wallet balance
3. Add family members (Mom/Kids) with spending limits
4. Distribute daily allowances to kids
5. Monitor transaction history
6. Update member settings or revoke access

**Child Account Flow**:
1. Receive daily allowance automatically
2. Spend within daily limit
3. Transactions appear in family history
4. View current balance and remaining limit

## 📚 Project Structure

```
app_design_ui/
├── components/           # React components
│   ├── AddMemberModal.tsx
│   ├── Dashboard.tsx
│   ├── FamilyMemberCard.tsx
│   ├── Header.tsx
│   ├── SettingsModal.tsx
│   ├── TransactionHistory.tsx
│   └── icons.tsx
├── services/            # Business logic
│   └── baseSubaccountService.ts  # In-memory family data service
├── contract/            # Smart contract ABIs
│   └── abis.ts          # FamilyManager contract ABI
├── App.tsx              # Main application component
├── types.ts             # TypeScript interfaces
├── index.tsx            # Application entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🧪 Manual QA Checklist

### Parent Flows
- [ ] Connect wallet successfully
- [ ] View correct main wallet balance
- [ ] Add new Mom member with monthly spending limit
- [ ] Add new Kid member with daily limit and allowance
- [ ] Edit existing member settings (limits/allowances)
- [ ] Revoke member access (with confirmation)
- [ ] Process daily allowances (balance updates correctly)
- [ ] View transaction history with all family activity

### Child/Mom Flows
- [ ] Kid receives initial allowance on creation
- [ ] Kid balance updates after daily allowance distribution
- [ ] Spending limit validation (attempt to exceed limit)
- [ ] Transaction appears in history immediately
- [ ] Member card displays correct balance and limits

### Category Blocks (Spending Controls)
- [ ] Daily limit enforced for Kid accounts
- [ ] Monthly limit enforced for Mom accounts
- [ ] Father account has unlimited spending (Infinity)
- [ ] Limit warnings displayed appropriately
- [ ] Cannot add member with negative limits

### Transaction List Refresh
- [ ] New transaction appears at top of history
- [ ] Transaction includes: date, member name, store, amount
- [ ] All transactions show correct status (Approved/Declined)
- [ ] History persists across page refreshes (in-memory)
- [ ] Toggle history visibility works correctly

### UI/UX Polish
- [ ] Mobile responsive on phones (320px+)
- [ ] Mobile responsive on tablets (768px+)
- [ ] Desktop layout optimal (1024px+)
- [ ] Loading state displays correctly
- [ ] Error states show helpful messages
- [ ] Modals close properly (ESC key, overlay click)
- [ ] Form validation prevents invalid inputs
- [ ] Buttons have hover states
- [ ] Cards have smooth transitions
- [ ] Avatar images load correctly

### Accessibility
- [ ] All buttons have descriptive labels
- [ ] Form inputs have associated labels
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works (Tab, Enter, ESC)
- [ ] Focus indicators visible

## ⚠️ Known Gaps & Limitations

### Current Implementation Status

**✅ Implemented (UI Demo)**:
- In-memory family data management (simulated backend)
- Member management (add, update, revoke)
- Transaction history tracking
- Daily allowance distribution
- Responsive UI with Tailwind styling
- Form validation and error handling

**⚠️ Not Yet Implemented**:

1. **Smart Contract Integration**:
   - FamilyManager contract ABI is available in `/contract/abis.ts`
   - Contract interaction using Wagmi/Viem not connected to UI
   - Transaction signing and on-chain execution missing
   - Real wallet connection not integrated (shows mock address)

2. **ABI-Supported Operations** (Available but not wired):
   - `addMember(address, uint256)` - Add authorized spender
   - `setSpendingLimit(address, uint256)` - Update spending limits
   - `spend(address, uint256)` - Execute spending transaction
   - `removeMember(address)` - Revoke member access
   - `depositToTreasury(uint256)` - Fund main wallet
   - `adminWithdraw(address, uint256)` - Admin withdrawal

3. **Wallet Integration**:
   - Sample wallet connection code exists in `/working_connect_wallet_sample/`
   - Uses Coinbase OnchainKit + Wagmi
   - Needs to be integrated into main app
   - Network switching/validation not implemented

4. **Token Operations**:
   - USDC token contract calls not implemented
   - Approval workflow for allowances missing
   - Balance reading from contract pending
   - Transaction fee estimation not available

5. **Data Persistence**:
   - Currently uses in-memory storage (resets on refresh)
   - No backend API or database
   - No localStorage/sessionStorage fallback
   - Contract events not monitored for updates

6. **Security Considerations**:
   - No signature verification
   - No rate limiting
   - No spending approval workflow
   - Parent authorization not enforced on-chain

7. **Missing Features**:
   - Category-based spending restrictions (groceries, entertainment, etc.)
   - Scheduled allowance automation (requires backend or cron)
   - Multi-signature approvals for large transactions
   - Transaction dispute/reversal mechanism
   - Email/SMS notifications
   - Spending analytics and reports
   - CSV export of transaction history

### Integration Roadmap

To connect the UI to the smart contract:

1. Install required dependencies:
   ```bash
   npm install wagmi viem @tanstack/react-query @coinbase/onchainkit
   ```

2. Set up Wagmi provider (reference: `/working_connect_wallet_sample/rootProvider.tsx`)

3. Replace `familyService` calls with contract interactions:
   - Use `useWriteContract` for state-changing operations
   - Use `useReadContract` for data fetching
   - Add transaction confirmation UI

4. Implement wallet connection in Header component

5. Add USDC approval flow before spending operations

6. Listen to contract events for real-time updates

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking (if configured)
npm run typecheck

# Linting (if configured)
npm run lint
```

## 🎨 Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 6.2.0
- **Language**: TypeScript 5.8.2
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Custom SVG components
- **Blockchain**: Base Sepolia (Layer 2)
- **Token**: USDC (6 decimals)

## 📖 Additional Resources

- [Base Documentation](https://docs.base.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [Coinbase OnchainKit Docs](https://onchainkit.xyz/)
- [Wagmi Documentation](https://wagmi.sh/)
- [USDC on Base](https://www.circle.com/en/usdc-multichain/base)

## 🐛 Troubleshooting

**Issue**: "Wrong Network" error
- **Solution**: Switch your wallet to Base Sepolia testnet (Chain ID: 84532)

**Issue**: Transaction fails with "insufficient funds"
- **Solution**: Ensure you have enough testnet ETH for gas fees

**Issue**: USDC amount shows incorrectly
- **Solution**: Remember USDC uses 6 decimals, not 18. Divide by 1e6 for display.

**Issue**: Cannot connect wallet
- **Solution**: Wallet integration is not yet implemented. Current version uses in-memory simulation.

**Issue**: Data resets on page refresh
- **Solution**: This is expected behavior. Data persistence requires backend or contract integration.

## 📝 License

This project is part of the BaseFam smart wallet concept demonstration.

## 🤝 Contributing

This is a demonstration project. For production deployment, implement the features listed under "Known Gaps & Limitations" above.

---

**View in AI Studio**: https://ai.studio/apps/drive/1raj76cumB96l3Ph_yuTTEvUKmx1RNMui
