# Family Manager SDK - Refactored API Guide

This guide documents the refactored Family Manager SDK with improved TanStack Query integration, consistent error handling, and type safety.

## Overview

The SDK provides a comprehensive set of React hooks for interacting with the FamilyManager smart contract on Base Sepolia. All hooks leverage Wagmi v2 with built-in TanStack Query integration for automatic caching, refetching, and state management.

## Key Improvements

- ✅ **Consistent API**: All read hooks return `{ data, isLoading, isError, error, refetch }`
- ✅ **Unified Write Hooks**: All write hooks return `{ write, hash, isPending, isConfirming, isSuccess, isError, error, reset }`
- ✅ **Automatic USDC Approval**: `useFundChild` handles approval flow automatically
- ✅ **Friendly Error Messages**: Contract reverts translated to user-friendly messages
- ✅ **ABI Validation**: Functions validated at runtime with helpful warnings
- ✅ **Query Invalidation**: Automatic cache refresh on successful transactions
- ✅ **Type Safety**: Proper TypeScript types throughout, no `any` types
- ✅ **Event Streaming**: Consolidated transaction feed with `useTransactionStream`
- ✅ **Environment Guardrails**: Config validation with informative warnings

## Installation & Setup

```typescript
import {
  useChildBalance,
  useChildLimits,
  useFundChild,
  useRegisterChild,
  toUsdcAmount,
  formatUsdcAmount,
  // ... other hooks
} from "@/src/hooks/use_family_manager";
```

## Contract Configuration

The SDK reads from environment variables with fallbacks:

```bash
NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia
```

If not set, informative console warnings are shown with fallback behavior.

## Read Hooks

All read hooks follow a consistent pattern with automatic query configuration.

### useChildBalance(childAddress?: Address)

Get USDC balance for a child address.

```typescript
const { data, balanceFormatted, isLoading, isError, error, refetch } = 
  useChildBalance(childAddress);

// data: bigint | undefined - raw balance in USDC units (6 decimals)
// balanceFormatted: string - formatted balance like "100.00"
// staleTime: 10 seconds
```

### useChildLimits(childAddress?: Address)

Get spending limits for a child.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useChildLimits(childAddress);

// data: { daily: bigint; weekly: bigint; monthly: bigint } | undefined
// staleTime: 30 seconds
```

### useChildSpent(childAddress?: Address)

Get current spending totals for a child.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useChildSpent(childAddress);

// data: { dailySpent: bigint; weeklySpent: bigint; monthlySpent: bigint } | undefined
// staleTime: 10 seconds
```

### useIsChildPaused(childAddress?: Address)

Check if a child account is paused.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useIsChildPaused(childAddress);

// data: boolean | undefined
// staleTime: 30 seconds
```

### useIsRegisteredChild(childAddress?: Address)

Check if an address is registered as a child.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useIsRegisteredChild(childAddress);

// data: boolean | undefined
// staleTime: 30 seconds
```

### useChildParent(childAddress?: Address)

Get the parent address for a child.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useChildParent(childAddress);

// data: Address | undefined
// staleTime: 30 seconds
```

### useIsCategoryBlocked(childAddress?: Address, categoryId?: number)

Check if a spending category is blocked for a child.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useIsCategoryBlocked(childAddress, 1);

// data: boolean | undefined
// staleTime: 30 seconds
```

### useParentChildren(parentAddress?: Address, index?: number)

Get a specific child by index from a parent's children array.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useParentChildren(parentAddress, 0);

// data: Address | undefined
```

### useUsdcAllowance(owner?: Address, spender?: Address)

Get USDC allowance for a spender.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useUsdcAllowance(ownerAddress, spenderAddress);

// data: bigint | undefined
// staleTime: 5 seconds
```

### useIsAuthorizedSpender(childAddress?: Address, spenderAddress?: Address)

Check if an address is authorized to spend on behalf of a child.

```typescript
const { data, isLoading, isError, error, refetch } = 
  useIsAuthorizedSpender(childAddress, spenderAddress);

// data: boolean | undefined
// staleTime: 30 seconds
```

## Write Hooks

All write hooks follow a consistent pattern with transaction tracking and error handling.

### useRegisterChild()

Register a new child account.

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useRegisterChild();

const handleRegister = async () => {
  try {
    await write(childAddress);
    // Transaction initiated, hash available immediately
  } catch (err) {
    // Error already translated to friendly message
    console.error(error);
  }
};
```

### useApproveUsdc()

Approve USDC spending (usually not needed directly, use `useFundChild` instead).

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useApproveUsdc();

await write(spenderAddress, amount);
```

### useFundChild()

Fund a child's account with USDC. **Automatically handles USDC approval!**

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useFundChild();

const handleFund = async () => {
  const amount = toUsdcAmount(100); // 100 USDC
  
  // autoApprove defaults to true, handles allowance check and approval automatically
  await write(childAddress, amount);
  
  // Or explicitly disable auto-approval:
  // await write(childAddress, amount, false);
};

// isPending includes both approval and funding transactions
```

**Smart Approval Flow:**
1. Checks current USDC allowance
2. If insufficient, automatically requests approval
3. Waits for approval confirmation
4. Proceeds with funding transaction
5. All handled in a single `write()` call!

### useUpdateChildLimits()

Update spending limits for a child.

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useUpdateChildLimits();

const newLimits: ChildLimits = {
  daily: toUsdcAmount(50),
  weekly: toUsdcAmount(200),
  monthly: toUsdcAmount(500),
};

await write(childAddress, newLimits);
```

### usePauseChild()

Pause or unpause a child account.

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  usePauseChild();

await write(childAddress, true);  // Pause
await write(childAddress, false); // Unpause
```

### useChildSpend()

Child spends USDC (called by child).

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useChildSpend();

const handleSpend = async () => {
  const amount = toUsdcAmount(10);
  const categoryId = 1; // e.g., 1 = Food
  
  await write(recipientAddress, amount, categoryId);
};
```

### useReclaimTokens()

Reclaim unallocated tokens (admin function).

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useReclaimTokens();

await write(destinationAddress);
```

### useUnregisterChild()

Remove a child from the system.

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useUnregisterChild();

await write(childAddress);
```

### useSetAuthorizedSpender()

Set authorized spender for a child.

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useSetAuthorizedSpender();

await write(childAddress, spenderAddress, true); // Authorize
await write(childAddress, spenderAddress, false); // Revoke
```

### useTransferChildParent()

Transfer child to a new parent.

```typescript
const { write, hash, isPending, isConfirming, isSuccess, isError, error, reset } = 
  useTransferChildParent();

await write(childAddress, newParentAddress);
```

### useBlockCategory()

⚠️ **Note**: This function is not available in the current contract ABI.

```typescript
const { write, isError, error } = useBlockCategory();

// isError will be true
// error: "Block category function not found in ABI..."
// Logs helpful warning on mount
```

## Event Hooks

### useFamilyManagerEvents()

Watch for real-time contract events.

```typescript
const { events, clearEvents } = useFamilyManagerEvents();

// Events automatically captured:
// - ChildRegistered
// - ChildFunded
// - LimitsUpdated
// - CategoryBlocked
// - Spent
// - ChildPaused

events.forEach(event => {
  console.log(event.type, event.timestamp, event.data, event.txHash);
});
```

### useTransactionStream()

Get sorted, consolidated transaction feed.

```typescript
const { transactions, count } = useTransactionStream();

// transactions: sorted by timestamp (newest first)
// count: total number of transactions

<ul>
  {transactions.map((tx, i) => (
    <li key={i}>
      {tx.type} - {new Date(tx.timestamp).toLocaleString()}
      {tx.txHash && <a href={`https://sepolia.basescan.org/tx/${tx.txHash}`}>View</a>}
    </li>
  ))}
</ul>
```

## Utility Functions

### USDC Amount Helpers

```typescript
import { toUsdcAmount, fromUsdcAmount, formatUsdcAmount } from "@/src/hooks/use_family_manager";

// Convert to USDC units (multiply by 10^6)
const amount = toUsdcAmount(100);        // 100 USDC → 100000000n
const amount2 = toUsdcAmount("50.50");   // 50.5 USDC → 50500000n

// Convert from USDC units (divide by 10^6)
const display = fromUsdcAmount(100000000n); // 100000000n → 100

// Format for display
const formatted = formatUsdcAmount(100000000n); // "100.00"
```

### ABI Validation

```typescript
import { hasAbiFunction, validateAbiFunction, familyManagerAbi } from "@/src/contracts/family_manager";

// Check if function exists
if (hasAbiFunction(familyManagerAbi, "registerChild")) {
  // Function is available
}

// Validate and throw if missing (used internally by write hooks)
try {
  validateAbiFunction(familyManagerAbi, "registerChild");
} catch (err) {
  // Function not found - error logged and thrown with friendly message
}
```

### Contract Addresses

```typescript
import { getFamilyManagerAddress, getUsdcAddress } from "@/src/contracts/family_manager";

const familyManager = getFamilyManagerAddress(); // 0x... with env fallback
const usdc = getUsdcAddress();                    // 0x... with env fallback
```

## Error Handling

All write hooks translate contract errors to friendly messages:

```typescript
const { write, error } = useRegisterChild();

// Contract error → Friendly message
// "AlreadyRegistered" → "This child is already registered"
// "NotParent" → "You are not the parent of this child"
// "Paused" → "This child account is paused"
// "ExceedsLimit" → "This transaction would exceed the spending limit"
// "CategoryBlocked" → "This spending category is blocked"
// "InsufficientBalance" → "Insufficient balance for this transaction"
// "user rejected" → "Transaction was rejected by user"
// "insufficient funds" → "Insufficient funds in your wallet"
// "network error" → "Network error. Please check your connection and try again."
```

## Complete Example

```typescript
import { useState } from "react";
import {
  useChildBalance,
  useChildLimits,
  useIsChildPaused,
  useRegisterChild,
  useFundChild,
  useUpdateChildLimits,
  usePauseChild,
  useTransactionStream,
  toUsdcAmount,
  formatUsdcAmount,
  type ChildLimits,
} from "@/src/hooks/use_family_manager";

export function ParentDashboard({ childAddress }: { childAddress: Address }) {
  // Read child state
  const { balanceFormatted, isLoading: balanceLoading } = useChildBalance(childAddress);
  const { data: limits, isLoading: limitsLoading } = useChildLimits(childAddress);
  const { data: isPaused } = useIsChildPaused(childAddress);
  const { transactions } = useTransactionStream();
  
  // Write operations
  const { write: registerChild, isPending: isRegistering, error: registerError } = useRegisterChild();
  const { write: fundChild, isPending: isFunding, error: fundError } = useFundChild();
  const { write: updateLimits, isPending: isUpdating } = useUpdateChildLimits();
  const { write: pauseChild, isPending: isPausing } = usePauseChild();
  
  const handleRegister = async () => {
    try {
      await registerChild(childAddress);
      console.log("Registered successfully!");
    } catch (err) {
      console.error("Failed:", registerError);
    }
  };
  
  const handleFund = async () => {
    try {
      const amount = toUsdcAmount(100); // 100 USDC
      await fundChild(childAddress, amount); // Auto-approves USDC if needed!
      console.log("Funded successfully!");
    } catch (err) {
      console.error("Failed:", fundError);
    }
  };
  
  const handleUpdateLimits = async () => {
    const newLimits: ChildLimits = {
      daily: toUsdcAmount(50),
      weekly: toUsdcAmount(200),
      monthly: toUsdcAmount(500),
    };
    await updateLimits(childAddress, newLimits);
  };
  
  const handleTogglePause = async () => {
    await pauseChild(childAddress, !isPaused);
  };
  
  return (
    <div>
      <h2>Child Dashboard</h2>
      
      {balanceLoading ? (
        <p>Loading balance...</p>
      ) : (
        <p>Balance: ${balanceFormatted} USDC</p>
      )}
      
      {limitsLoading ? (
        <p>Loading limits...</p>
      ) : limits ? (
        <div>
          <p>Daily: ${formatUsdcAmount(limits.daily)}</p>
          <p>Weekly: ${formatUsdcAmount(limits.weekly)}</p>
          <p>Monthly: ${formatUsdcAmount(limits.monthly)}</p>
        </div>
      ) : null}
      
      <p>Status: {isPaused ? "Paused" : "Active"}</p>
      
      <div>
        <button onClick={handleRegister} disabled={isRegistering}>
          {isRegistering ? "Registering..." : "Register Child"}
        </button>
        {registerError && <p className="error">{registerError}</p>}
        
        <button onClick={handleFund} disabled={isFunding}>
          {isFunding ? "Funding..." : "Fund $100"}
        </button>
        {fundError && <p className="error">{fundError}</p>}
        
        <button onClick={handleUpdateLimits} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Limits"}
        </button>
        
        <button onClick={handleTogglePause} disabled={isPausing}>
          {isPausing ? "Processing..." : isPaused ? "Unpause" : "Pause"}
        </button>
      </div>
      
      <h3>Recent Activity</h3>
      <ul>
        {transactions.map((tx, i) => (
          <li key={i}>
            {tx.type} - {new Date(tx.timestamp).toLocaleString()}
            {tx.txHash && (
              <a href={`https://sepolia.basescan.org/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer">
                View
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## TypeScript Types

```typescript
// From the SDK
export type ChildLimits = {
  daily: bigint;
  weekly: bigint;
  monthly: bigint;
};

export type ChildSpent = {
  dailySpent: bigint;
  weeklySpent: bigint;
  monthlySpent: bigint;
};

export type TransactionEvent = {
  type: "ChildRegistered" | "ChildFunded" | "LimitsUpdated" | 
        "CategoryBlocked" | "Spent" | "ChildPaused" | 
        "AuthorizedSpenderSet" | "ChildUnregistered" | 
        "ParentTransferred" | "TokensReclaimed";
  timestamp: number;
  data: Record<string, unknown>;
  txHash?: string | null;
};

type ReadHookResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

type WriteHookResult<TArgs extends unknown[]> = {
  write: (...args: TArgs) => Promise<void>;
  hash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  reset: () => void;
};
```

## Best Practices

1. **Always handle errors**: Display error messages to users
2. **Use isPending for UX**: Show loading states during transactions
3. **Wait for isSuccess**: Don't assume transaction succeeded until confirmed
4. **Use formatUsdcAmount for display**: Always format bigint amounts
5. **Leverage auto-approval**: Let `useFundChild` handle USDC approval
6. **Monitor transactions**: Use `useTransactionStream` for activity feeds
7. **Refetch after actions**: Query cache auto-invalidates on success
8. **Type your components**: Use exported types for props and state

## Migration from Old API

### Before (Old API)
```typescript
// Multiple separate hooks
const { fundWithApproval, isPending, error } = useFundChildWithApproval();
const { balance } = useChildBalance(address);
const { limits } = useChildLimits(address);

// Manual approval flow
await fundWithApproval(address, amount);
```

### After (New API)
```typescript
// Consistent naming and structure
const { write: fundChild, isPending, error } = useFundChild();
const { data: balance } = useChildBalance(address);
const { data: limits } = useChildLimits(address);

// Auto-approval built-in
await fundChild(address, amount); // Approval automatic!
```

## Support

For issues or questions:
- Check console for detailed warnings and errors
- Verify environment variables are set correctly
- Ensure you're on Base Sepolia network (chainId: 84532)
- Check that contract is deployed at configured address
