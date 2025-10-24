# BaseFam App - Next.js Implementation

This directory contains the Next.js App Router implementation of the BaseFam smart family wallet.

## Structure

```
app/
├── components/
│   ├── ParentDashboard.tsx    # Parent account view with children management
│   ├── ChildView.tsx          # Child account view with limits display
│   ├── TxList.tsx             # Transaction history component
│   └── Notifications.tsx      # Global notification system
├── globals.css                # Global styles and animations
├── layout.tsx                 # Root layout with providers
├── page.tsx                   # Main page with role routing
└── README.md                  # This file
```

## Features

### Wallet Connection
- Connect wallet CTA for disconnected users
- Uses Coinbase OnchainKit Wallet component
- Supports MetaMask and Coinbase Wallet

### Network Guard
- Enforces Base Sepolia network
- Shows network switch prompt if on wrong network
- Uses wagmi's `useSwitchChain` hook

### Role Detection
- Queries `isRegisteredChild` to check if user is a child
- Queries `parentToChildren[0]` to check if user is a parent
- Automatically determines role from contract state

### Manual Override (Development Only)
- Toggle between parent/child views for testing
- Only shown in development mode
- Helpful for testing different UI states

### Role-Based Rendering
- **Parent Dashboard**: Shows children list, stats, management actions
- **Child View**: Shows allowance, spending limits, parent info
- **Transaction List**: Shows transaction history for the account

### State Management
- Loading states during role detection
- Error states with retry functionality
- Graceful handling of disconnected wallet
- Network mismatch handling

### Notifications
- Global notification container
- Success, error, and info message types
- Auto-dismiss after 5 seconds
- Animated slide-in from right

## Environment Variables

Required environment variables (see `.env.example`):

```
NEXT_PUBLIC_CDP_API_KEY=your_coinbase_api_key
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS=0x...
```

## Contract Integration

The app integrates with the FamilyManager smart contract using:
- Contract ABI from `../contract/abis.ts`
- Wagmi's `useReadContract` hook for reading contract state
- Functions used:
  - `isRegisteredChild(address)` - Check if address is a child
  - `parentToChildren(address, uint256)` - Get children of parent
  - `getChildParent(address)` - Get parent of child
  - `getChildLimits(address)` - Get spending limits
  - `isChildPaused(address)` - Check if child is paused

## Development

### Testing Role Override

In development mode, use the role override toggle to test different views:
- **Auto-detect**: Uses contract state
- **Override as Parent**: Forces parent view
- **Override as Child**: Forces child view

### Adding New Features

To add new features:
1. Contract calls should use `useReadContract` or `useWriteContract`
2. Add UI to the appropriate component (ParentDashboard or ChildView)
3. Use the `onNotification` callback to show user feedback
4. Update the TxList component to show new transaction types

## Styling

- Uses Tailwind CSS for styling
- Custom colors defined in `tailwind.config.js`:
  - `base-blue`: Primary brand color (#0052FF)
  - `base-blue-dark`: Darker variant (#0041CC)
  - `light-bg`: Light background (#F5F8FA)
  - Additional utility colors
- Responsive design with mobile-first approach
- Custom animations in `globals.css`

## Future Enhancements

- [ ] Real-time transaction monitoring
- [ ] Transaction history from blockchain events
- [ ] Write operations (register child, fund, etc.)
- [ ] Balance display from contract
- [ ] Spending tracking and analytics
- [ ] Push notifications
- [ ] Mobile PWA support
