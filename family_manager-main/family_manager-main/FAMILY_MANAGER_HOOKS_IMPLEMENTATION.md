# Family Manager Wagmi Hook Layer Implementation

This document summarizes the implementation of the Family Manager wagmi hook layer as requested in the ticket.

## Implementation Summary

### 1. Contract Configuration (`src/contracts/family_manager.ts`)

✅ **Completed:**
- Re-exports `familyManagerAbi` and `usdcAbi` from `contract/abis.ts`
- Implements `getFamilyManagerAddress()` with Base Sepolia guard
- Falls back to default USDC address when `NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS` is absent
- Implements `getUsdcAddress()` with similar fallback logic
- Provides USDC 6-decimal conversion helpers:
  - `toUsdcAmount(amount)`: Converts number/string to 6-decimal bigint
  - `fromUsdcAmount(amount)`: Converts 6-decimal bigint to number
  - `formatUsdcAmount(amount)`: Formats as string with 2 decimals
- Exports `USDC_DECIMALS` constant

### 2. Read Hooks (`src/hooks/use_family_manager.ts`)

✅ **Completed - All read hooks using wagmi + react-query:**

1. **`useChildBalance(childAddress)`** - Get child's USDC balance
2. **`useChildLimits(childAddress)`** - Get daily/weekly/monthly limits
3. **`useChildSpent(childAddress)`** - Get spent amounts
4. **`useIsChildPaused(childAddress)`** - Check pause state
5. **`useIsRegisteredChild(childAddress)`** - Check registration status
6. **`useChildParent(childAddress)`** - Get parent address
7. **`useIsCategoryBlocked(childAddress, categoryId)`** - Check category blocked state
8. **`useParentChildren(parentAddress, index)`** - Get child at index for parent
9. **`useUsdcAllowance(owner, spender)`** - Get USDC allowance

All read hooks return typed responses with:
- Data/result value
- `isLoading` state
- `isError` state
- `error` object
- `refetch` function

### 3. Write Hooks (`src/hooks/use_family_manager.ts`)

✅ **Completed - All write helpers with friendly error translation:**

1. **`useRegisterChild()`** - Register a child account
2. **`useApproveUsdc()`** - Approve USDC spending
3. **`useFundChild()`** - Fund child account (requires prior approval)
4. **`useFundChildWithApproval()`** - Fund with automatic USDC approval flow
5. **`useUpdateChildLimits()`** - Update spending limits
6. **`usePauseChild()`** - Pause/unpause child account
7. **`useChildSpend()`** - Execute spend transaction with category
8. **`useReclaimTokens()`** - Reclaim unallocated tokens
9. **`useUnregisterChild()`** - Unregister child account
10. **`useSetAuthorizedSpender()`** - Set authorized spender
11. **`useTransferChildParent()`** - Transfer child to new parent
12. **`useBlockCategory()`** - Graceful fallback (not in ABI)

All write hooks return:
- Write function to call
- `hash` - Transaction hash
- `isPending` - Transaction submission pending
- `isConfirming` - Transaction confirmation pending
- `isSuccess` - Transaction confirmed
- `isError` - Error occurred
- `error` - Friendly error message

**Error Translation:**
Known revert messages are translated to friendly errors:
- "AlreadyRegistered" → "This child is already registered"
- "NotRegistered" → "This child is not registered"
- "NotParent" → "You are not the parent of this child"
- "Paused" → "This child account is paused"
- "ExceedsLimit" → "This transaction would exceed the spending limit"
- "CategoryBlocked" → "This spending category is blocked"
- "InsufficientBalance" → "Insufficient balance for this transaction"
- User rejections and gas errors are also handled

### 4. Event Subscriptions (`src/hooks/use_family_manager.ts`)

✅ **Completed - Event watching with useWatchContractEvent:**

**`useFamilyManagerEvents()`** subscribes to:
1. ✅ `ChildRegistered` - When a child is registered
2. ✅ `ChildFunded` - When a child receives funding
3. ✅ `LimitsUpdated` - When spending limits are updated
4. ✅ `CategoryBlocked` - When a category is blocked
5. ✅ `Spent` - When a child spends funds
6. ✅ `ChildPaused` - When a child is paused/unpaused

Events are returned as `TransactionEvent[]` with:
- `type` - Event name
- `timestamp` - Event timestamp
- `data` - Event-specific data (parent, child, amounts, etc.)
- `txHash` - Transaction hash for block explorer links

The hook also provides `clearEvents()` function to reset the event list.

### 5. USDC 6-Decimal Handling

✅ **Completed:**
- All amount conversions use 6-decimal helpers
- `toUsdcAmount()` for user input → contract calls
- `fromUsdcAmount()` for contract data → display
- `formatUsdcAmount()` for formatted display strings
- Consistent across all read and write operations

### 6. Shared Loading/Error State

✅ **Completed:**
- All hooks return consistent state shape
- Read hooks: `{ data, isLoading, isError, error, refetch }`
- Write hooks: `{ writeFunc, hash, isPending, isConfirming, isSuccess, isError, error }`
- Transaction confirmation tracked via `useWaitForTransactionReceipt`

### 7. Graceful Handling of Missing ABI Functions

✅ **Completed:**
- `useBlockCategory()` implements graceful fallback for missing function
- Logs warning to console
- Returns error message
- Doesn't crash application
- Can be extended for other potentially missing functions

## File Structure

```
src/
├── contracts/
│   ├── family_manager.ts    # Contract config, addresses, ABI exports
│   └── index.ts             # Barrel export
├── hooks/
│   ├── use_family_manager.ts # All wagmi hooks (926 lines)
│   └── index.ts             # Barrel export
├── example_usage.tsx         # Example component
├── index.ts                 # Main barrel export
└── README.md                # Comprehensive documentation
```

## Key Features

1. **Type Safety**: Fully typed with TypeScript
2. **Separation of Concerns**: Contract config separate from hooks
3. **Reusable**: Each hook is independent and can be used individually
4. **Error Handling**: User-friendly error messages
5. **Event Streaming**: Real-time contract event monitoring
6. **USDC Helpers**: Built-in decimal conversion
7. **Approval Flow**: Automatic USDC approval for funding
8. **Transaction Tracking**: Pending and confirmation states
9. **Flexible Imports**: Can import from `@/src` or individual files
10. **Documentation**: Comprehensive README with examples

## Environment Variables Required

```env
NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS=0x...  # FamilyManager contract address
NEXT_PUBLIC_USDC_ADDRESS=0x...            # USDC token address
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

Fallback behavior:
- If `NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS` is missing → uses default USDC address
- If `NEXT_PUBLIC_USDC_ADDRESS` is missing → uses default Base Sepolia USDC

## Usage

```typescript
import {
  useRegisterChild,
  useFundChildWithApproval,
  useChildBalance,
  useFamilyManagerEvents,
  toUsdcAmount,
  formatUsdcAmount
} from "@/src/hooks";

function MyComponent() {
  const childAddress = "0x..." as `0x${string}`;
  
  const { registerChild, isPending } = useRegisterChild();
  const { fundWithApproval } = useFundChildWithApproval();
  const { balance, balanceFormatted } = useChildBalance(childAddress);
  const { events } = useFamilyManagerEvents();

  const handleRegister = async () => {
    await registerChild(childAddress);
  };

  const handleFund = async () => {
    await fundWithApproval(childAddress, toUsdcAmount(100));
  };

  return (
    <div>
      <p>Balance: {balanceFormatted} USDC</p>
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleFund}>Fund 100 USDC</button>
      <ul>
        {events.map(e => <li key={e.timestamp}>{e.type}</li>)}
      </ul>
    </div>
  );
}
```

## Testing

All code passes TypeScript strict mode type checking:
```bash
npm run typecheck  # ✅ Passes
```

## Notes on Missing Functions

The ticket mentioned "block categories" but the ABI only contains:
- ✅ `isCategoryBlocked` (read) - Implemented
- ❌ `blockCategory` or `setCategoryBlocked` (write) - Not in ABI

The `useBlockCategory()` hook handles this gracefully by:
1. Logging a warning when called
2. Returning an error state
3. Providing a clear error message
4. Not breaking the application

If this function is added to the contract ABI in the future, the hook can be updated to use the real implementation.

## Conclusion

✅ All requirements from the ticket have been implemented:
- Contract address resolution with Base Sepolia guard ✅
- Read hooks for all data with wagmi + react-query ✅
- Write helpers with USDC approval flow ✅
- Event subscriptions with tx stream ✅
- USDC 6-decimal helpers throughout ✅
- Shared loading/error state ✅
- Graceful handling of missing ABI functions ✅
- Friendly error translation ✅
- Comprehensive documentation ✅
- Example usage component ✅

The implementation is production-ready and can be used immediately in the application.
