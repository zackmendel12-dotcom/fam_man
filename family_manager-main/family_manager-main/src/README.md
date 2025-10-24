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
├── lib/
│   ├── units.ts             # USDC unit conversion utilities
│   ├── address.ts           # Address validation helpers
│   ├── __tests__/           # Unit tests for utilities
│   │   ├── units.test.ts
│   │   └── address.test.ts
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

### USDC Unit Conversion Utilities (`src/lib/units.ts`)

All USDC amounts use 6 decimal precision (1 USDC = 1,000,000 units).

#### Conversion Functions

- **`toUsdcAmount(amount: number | string): bigint`**: Converts a number or string to USDC units (bigint)
  - Throws error for negative, infinite, or invalid values
  - Supports decimal precision up to 6 places
  - Example: `toUsdcAmount("1.5")` → `1500000n`

- **`fromUsdcAmount(amount: bigint): string`**: Converts USDC units to decimal string
  - Returns full 6-decimal precision
  - Example: `fromUsdcAmount(1500000n)` → `"1.500000"`

- **`formatUsdcAmount(amount: bigint, decimals?: number): string`**: Formats USDC amount with specified decimals (default: 2)
  - Example: `formatUsdcAmount(1500000n)` → `"1.50"`
  - Example: `formatUsdcAmount(1123456n, 4)` → `"1.1234"`

- **`parseUsdcInput(input: string): { value: bigint; error: string | null }`**: Safely parses user input
  - Returns parsed value and error message if invalid
  - Example: `parseUsdcInput("1.5")` → `{ value: 1500000n, error: null }`

#### Validation Functions

- **`isZeroUsdc(amount: bigint): boolean`**: Checks if amount is zero
- **`isNegativeUsdc(amount: bigint): boolean`**: Checks if amount is negative
- **`isPositiveUsdc(amount: bigint): boolean`**: Checks if amount is positive

#### Arithmetic Functions

- **`addUsdc(a: bigint, b: bigint): bigint`**: Adds two USDC amounts
- **`subtractUsdc(a: bigint, b: bigint): bigint`**: Subtracts b from a (throws if result would be negative)
- **`compareUsdc(a: bigint, b: bigint): number`**: Compares two amounts (-1, 0, or 1)
- **`minUsdc(a: bigint, b: bigint): bigint`**: Returns minimum amount
- **`maxUsdc(a: bigint, b: bigint): bigint`**: Returns maximum amount

### Address Validation Utilities (`src/lib/address.ts`)

Ethereum address validation using viem utilities.

- **`validateAddress(address: string): { valid: boolean; error: string | null }`**: Validates Ethereum address format
  - Trims whitespace automatically
  - Returns validation result with error message

- **`validateAddressWithChecksum(address: string): { valid: boolean; error: string | null; checksummed?: Address }`**: Validates address and checks checksum
  - Returns checksummed version if valid
  - Detects incorrect checksum casing

- **`isValidAddress(address: string): boolean`**: Type guard for valid addresses
  - Returns true if address is valid Ethereum address

- **`normalizeAddress(address: string): Address`**: Converts address to checksummed format
  - Throws error if address is invalid
  - Trims whitespace automatically

- **`isZeroAddress(address: string): boolean`**: Checks if address is zero address (0x000...000)

- **`isSameAddress(a: string, b: string): boolean`**: Case-insensitive address comparison

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
import { 
  toUsdcAmount, 
  fromUsdcAmount, 
  formatUsdcAmount, 
  parseUsdcInput,
  isPositiveUsdc,
  compareUsdc 
} from "@/src/lib/units";

// Convert to USDC amount (6 decimals)
const amount = toUsdcAmount(100); // 100 USDC → 100000000n
const amountFromString = toUsdcAmount("1.5"); // "1.5" USDC → 1500000n

// Convert from USDC amount
const humanAmount = fromUsdcAmount(100000000n); // 100000000n → "100.000000"

// Format for display with custom decimals
const formatted = formatUsdcAmount(100000000n); // "100.00" (default 2 decimals)
const formattedDetailed = formatUsdcAmount(1123456n, 4); // "1.1234"

// Safe parsing of user input
const { value, error } = parseUsdcInput("10.50");
if (error) {
  console.error("Invalid input:", error);
} else {
  console.log("Parsed value:", value); // 10500000n
}

// Validation
if (isPositiveUsdc(amount)) {
  console.log("Amount is positive");
}

// Comparison
if (compareUsdc(amount1, amount2) > 0) {
  console.log("amount1 is greater");
}
```

## Address Validation Helpers

Use the address validation utilities for user input and address handling:

```typescript
import { 
  validateAddress, 
  normalizeAddress, 
  isValidAddress,
  isSameAddress,
  isZeroAddress 
} from "@/src/lib/address";

// Validate user input
const { valid, error } = validateAddress(userInput);
if (!valid) {
  console.error("Invalid address:", error);
}

// Type guard
if (isValidAddress(userInput)) {
  // TypeScript knows userInput is Address type here
  const normalized = normalizeAddress(userInput);
}

// Compare addresses (case-insensitive)
if (isSameAddress(address1, address2)) {
  console.log("Same address");
}

// Check for zero address
if (isZeroAddress(address)) {
  console.error("Cannot use zero address");
}
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

### Unit Tests

The utility libraries have comprehensive unit test coverage using Vitest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

The test suite covers:
- **USDC Unit Conversion**: Round-trip conversions, precision handling, edge cases, validation, and arithmetic operations
- **Address Validation**: Format validation, checksum verification, zero address detection, and address comparison

Test files are located in `src/lib/__tests__/`.

### Integration Testing

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
