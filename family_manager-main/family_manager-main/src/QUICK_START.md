# Quick Start Guide - Family Manager Hooks

Get started with the Family Manager wagmi hooks in 5 minutes.

## Step 1: Setup Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS=0xYourFamilyManagerContractAddress
NEXT_PUBLIC_USDC_ADDRESS=0xYourUSDCTokenAddress
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

## Step 2: Import the Hooks

```typescript
import { 
  useRegisterChild,
  useFundChildWithApproval,
  useChildBalance,
  toUsdcAmount 
} from "@/src/hooks";
```

## Step 3: Use in Your Component

```typescript
"use client";

import { useAccount } from "wagmi";
import { 
  useRegisterChild, 
  useFundChildWithApproval,
  toUsdcAmount 
} from "@/src/hooks";

export function FamilyDashboard() {
  const { address } = useAccount();
  const childAddress = "0x..." as `0x${string}`;
  
  const { registerChild, isPending, error } = useRegisterChild();
  const { fundWithApproval, isPending: isFunding } = useFundChildWithApproval();

  return (
    <div>
      <button 
        onClick={() => registerChild(childAddress)}
        disabled={isPending}
      >
        {isPending ? "Registering..." : "Register Child"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button 
        onClick={() => fundWithApproval(childAddress, toUsdcAmount(100))}
        disabled={isFunding}
      >
        {isFunding ? "Funding..." : "Fund 100 USDC"}
      </button>
    </div>
  );
}
```

## Common Patterns

### Reading Child Data

```typescript
import { useChildBalance, useChildLimits, useIsChildPaused } from "@/src/hooks";

function ChildProfile({ childAddress }: { childAddress: `0x${string}` }) {
  const { balanceFormatted, isLoading } = useChildBalance(childAddress);
  const { limits } = useChildLimits(childAddress);
  const { isPaused } = useIsChildPaused(childAddress);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Balance: ${balanceFormatted} USDC</p>
      <p>Status: {isPaused ? "Paused" : "Active"}</p>
      {limits && (
        <p>Daily Limit: ${formatUsdcAmount(limits.daily)}</p>
      )}
    </div>
  );
}
```

### Updating Limits

```typescript
import { useUpdateChildLimits, toUsdcAmount } from "@/src/hooks";

function LimitsForm({ childAddress }: { childAddress: `0x${string}` }) {
  const { updateLimits, isPending, isSuccess } = useUpdateChildLimits();

  const handleSubmit = async () => {
    await updateLimits(childAddress, {
      daily: toUsdcAmount(50),
      weekly: toUsdcAmount(200),
      monthly: toUsdcAmount(500),
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "Updating..." : "Update Limits"}
    </button>
  );
}
```

### Watching Events

```typescript
import { useFamilyManagerEvents } from "@/src/hooks";

function ActivityFeed() {
  const { events, clearEvents } = useFamilyManagerEvents();

  return (
    <div>
      <h2>Recent Activity</h2>
      <button onClick={clearEvents}>Clear</button>
      <ul>
        {events.map((event, i) => (
          <li key={i}>
            <strong>{event.type}</strong>
            <span>{new Date(event.timestamp).toLocaleString()}</span>
            {event.txHash && (
              <a 
                href={`https://sepolia.basescan.org/tx/${event.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View TX
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Handling Errors

```typescript
import { useRegisterChild } from "@/src/hooks";

function RegisterButton({ childAddress }: { childAddress: `0x${string}` }) {
  const { registerChild, isPending, error, isSuccess } = useRegisterChild();

  const handleRegister = async () => {
    try {
      await registerChild(childAddress);
      alert("Child registered successfully!");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div>
      <button onClick={handleRegister} disabled={isPending}>
        Register Child
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isSuccess && <p style={{ color: "green" }}>Success!</p>}
    </div>
  );
}
```

## Tips

### Working with Amounts

Always use the USDC helpers for amounts:

```typescript
import { toUsdcAmount, fromUsdcAmount, formatUsdcAmount } from "@/src/hooks";

const amount = toUsdcAmount(100);        // User input → Contract
const num = fromUsdcAmount(amount);       // Contract → Number
const display = formatUsdcAmount(amount); // Contract → "100.00"
```

### Transaction States

Write hooks provide multiple states:

- `isPending`: User needs to sign
- `isConfirming`: Transaction submitted, waiting for confirmation
- `isSuccess`: Transaction confirmed
- `isError`: Transaction failed
- `error`: User-friendly error message

### Refetching Data

All read hooks provide a `refetch` function:

```typescript
const { balance, refetch } = useChildBalance(childAddress);

// After funding, refresh the balance
await fundChild(childAddress, amount);
await refetch();
```

## Need More Help?

- See `src/example_usage.tsx` for a complete example
- Read `src/README.md` for full documentation
- Check the TypeScript types for autocomplete guidance
