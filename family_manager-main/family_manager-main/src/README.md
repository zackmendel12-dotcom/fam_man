# Family Manager Wagmi Hook Layer

This directory contains the contract configuration and React hooks for interacting with the FamilyManager smart contract on Base Sepolia.

## Structure

```
src/
├── contracts/
│   ├── family_manager.ts    # Contract addresses and ABI exports
│   └── index.ts             # Barrel export
├── hooks/
│   ├── use_family_manager.ts # All wagmi hooks for contract interaction
│   └── index.ts             # Barrel export
├── example_usage.tsx         # Example component demonstrating usage
└── README.md                # This file
```

## Configuration

### Environment Variables

Set the following environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

If `NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS` is not set, it will fall back to the default USDC address with a console warning.

## Features

### Contract Utilities (`src/contracts/family_manager.ts`)

- **`getFamilyManagerAddress()`**: Returns the FamilyManager contract address with Base Sepolia guard
- **`getUsdcAddress()`**: Returns the USDC contract address
- **`toUsdcAmount(amount)`**: Converts a number to USDC 6-decimal format (bigint)
- **`fromUsdcAmount(amount)`**: Converts USDC 6-decimal bigint to number
- **`formatUsdcAmount(amount)`**: Formats USDC amount as string with 2 decimals

### Read Hooks

All read hooks return `{ data, isLoading, isError, error, refetch }`:

- **`useChildBalance(childAddress)`**: Get child's USDC balance
  - Returns: `{ balance, balanceFormatted, isLoading, isError, error, refetch }`
  
- **`useChildLimits(childAddress)`**: Get child's spending limits (daily, weekly, monthly)
  - Returns: `{ limits: { daily, weekly, monthly }, isLoading, isError, error, refetch }`
  
- **`useChildSpent(childAddress)`**: Get child's spent amounts
  - Returns: `{ spent: { dailySpent, weeklySpent, monthlySpent }, isLoading, isError, error, refetch }`
  
- **`useIsChildPaused(childAddress)`**: Check if child account is paused
  - Returns: `{ isPaused, isLoading, isError, error, refetch }`
  
- **`useIsRegisteredChild(childAddress)`**: Check if address is a registered child
  - Returns: `{ isRegistered, isLoading, isError, error, refetch }`
  
- **`useChildParent(childAddress)`**: Get the parent address of a child
  - Returns: `{ parent, isLoading, isError, error, refetch }`
  
- **`useIsCategoryBlocked(childAddress, categoryId)`**: Check if spending category is blocked
  - Returns: `{ isBlocked, isLoading, isError, error, refetch }`
  
- **`useParentChildren(parentAddress, index)`**: Get child at specific index for a parent
  - Returns: `{ child, isLoading, isError, error, refetch }`
  
- **`useUsdcAllowance(owner, spender)`**: Get USDC allowance
  - Returns: `{ allowance, isLoading, isError, error, refetch }`

### Write Hooks

All write hooks return `{ writeFunction, hash, isPending, isConfirming, isSuccess, isError, error }`:

- **`useRegisterChild()`**: Register a new child account
  ```typescript
  const { registerChild, isPending, isSuccess, error } = useRegisterChild();
  await registerChild(childAddress);
  ```

- **`useApproveUsdc()`**: Approve USDC spending (used internally by `useFundChildWithApproval`)
  ```typescript
  const { approve, isPending, isSuccess } = useApproveUsdc();
  await approve(spenderAddress, amount);
  ```

- **`useFundChild()`**: Fund a child account (requires prior USDC approval)
  ```typescript
  const { fundChild, isPending, isSuccess } = useFundChild();
  await fundChild(childAddress, amount);
  ```

- **`useFundChildWithApproval()`**: Fund child with automatic USDC approval flow
  ```typescript
  const { fundWithApproval, isPending, isSuccess } = useFundChildWithApproval();
  await fundWithApproval(childAddress, toUsdcAmount(100));
  ```

- **`useUpdateChildLimits()`**: Update spending limits for a child
  ```typescript
  const { updateLimits, isPending, isSuccess } = useUpdateChildLimits();
  await updateLimits(childAddress, {
    daily: toUsdcAmount(50),
    weekly: toUsdcAmount(200),
    monthly: toUsdcAmount(500),
  });
  ```

- **`usePauseChild()`**: Pause or unpause a child account
  ```typescript
  const { pauseChild, isPending, isSuccess } = usePauseChild();
  await pauseChild(childAddress, true); // true to pause, false to unpause
  ```

- **`useChildSpend()`**: Spend USDC from child account
  ```typescript
  const { spend, isPending, isSuccess } = useChildSpend();
  await spend(recipientAddress, toUsdcAmount(10), categoryId);
  ```

- **`useReclaimTokens()`**: Reclaim unallocated tokens
  ```typescript
  const { reclaim, isPending, isSuccess } = useReclaimTokens();
  await reclaim(toAddress);
  ```

- **`useUnregisterChild()`**: Unregister a child account
  ```typescript
  const { unregisterChild, isPending, isSuccess } = useUnregisterChild();
  await unregisterChild(childAddress);
  ```

- **`useSetAuthorizedSpender()`**: Set authorized spender for a child
  ```typescript
  const { setAuthorizedSpender, isPending, isSuccess } = useSetAuthorizedSpender();
  await setAuthorizedSpender(childAddress, spenderAddress, true); // true to authorize
  ```

- **`useTransferChildParent()`**: Transfer child to a new parent
  ```typescript
  const { transferChildParent, isPending, isSuccess } = useTransferChildParent();
  await transferChildParent(childAddress, newParentAddress);
  ```

- **`useBlockCategory()`**: Block a spending category (graceful fallback - not available in current ABI)
  ```typescript
  const { blockCategory, error } = useBlockCategory();
  // This function logs a warning and returns an error since it's not in the ABI
  ```

### Event Subscription

- **`useFamilyManagerEvents()`**: Subscribe to contract events
  ```typescript
  const { events, clearEvents } = useFamilyManagerEvents();
  
  // Events include:
  // - ChildRegistered
  // - ChildFunded
  // - LimitsUpdated
  // - CategoryBlocked
  // - Spent
  // - ChildPaused
  
  events.forEach(event => {
    console.log(event.type, event.data, event.txHash);
  });
  ```

## Error Handling

All write hooks translate common contract revert messages to friendly error strings:

- "AlreadyRegistered" → "This child is already registered"
- "NotRegistered" → "This child is not registered"
- "NotParent" → "You are not the parent of this child"
- "Paused" → "This child account is paused"
- "ExceedsLimit" → "This transaction would exceed the spending limit"
- "CategoryBlocked" → "This spending category is blocked"
- "InsufficientBalance" → "Insufficient balance for this transaction"
- User rejections and other errors are also handled gracefully

## USDC Decimal Helpers

USDC uses 6 decimals. Always use the helper functions when working with amounts:

```typescript
// Convert to USDC amount (6 decimals)
const amount = toUsdcAmount(100); // 100 USDC → 100000000n

// Convert from USDC amount
const humanAmount = fromUsdcAmount(100000000n); // 100000000n → 100

// Format for display
const formatted = formatUsdcAmount(100000000n); // "100.00"
```

## Usage Example

See `src/example_usage.tsx` for a complete example component.

Basic usage:

```typescript
import { useRegisterChild, useFundChildWithApproval, toUsdcAmount } from "@/src/hooks";

function MyComponent() {
  const childAddress = "0x..." as `0x${string}`;
  
  const { registerChild, isPending, error } = useRegisterChild();
  const { fundWithApproval, isPending: isFunding } = useFundChildWithApproval();

  const handleRegister = async () => {
    try {
      await registerChild(childAddress);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFund = async () => {
    try {
      await fundWithApproval(childAddress, toUsdcAmount(100));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleRegister} disabled={isPending}>
        Register Child
      </button>
      {error && <p>{error}</p>}
      
      <button onClick={handleFund} disabled={isFunding}>
        Fund Child (100 USDC)
      </button>
    </div>
  );
}
```

## Graceful Handling of Missing ABI Functions

If a function is not found in the ABI (like `blockCategory`), the hook will:
1. Log a warning to the console
2. Return an error message
3. Prevent the application from crashing

This ensures forward compatibility if the contract ABI changes.

## Testing

To test the hooks in your application:

1. Ensure you have a wallet connected via wagmi
2. Make sure you're on Base Sepolia network
3. Have some test USDC in your wallet
4. Use the example component as a starting point

## Type Safety

All hooks are fully typed with TypeScript. The main types are:

```typescript
type ChildLimits = {
  daily: bigint;
  weekly: bigint;
  monthly: bigint;
};

type ChildSpent = {
  dailySpent: bigint;
  weeklySpent: bigint;
  monthlySpent: bigint;
};

type TransactionEvent = {
  type: "ChildRegistered" | "ChildFunded" | "LimitsUpdated" | "CategoryBlocked" | "Spent" | "ChildPaused";
  timestamp: number;
  data: any;
  txHash?: string | null;
};
```

## Notes

- All transactions require the user to sign with their wallet
- Make sure sufficient gas is available for transactions
- USDC approval is handled automatically by `useFundChildWithApproval`
- Event subscriptions are active while the component is mounted
- Transaction confirmations are tracked automatically via `useWaitForTransactionReceipt`
