# Contract Integration Example

This file demonstrates how to extend the TestActions component to integrate with real smart contracts using Wagmi and the FamilyManager ABI.

## Prerequisites

```bash
npm install wagmi viem @tanstack/react-query
```

## Example: Adding Contract Write Functions

### 1. Setup Wagmi Config

Use the config from `working_connect_wallet_sample/wagmi.config.ts`:

```typescript
import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask({ dappMetadata: { name: 'Family Management App' } }),
    coinbaseWallet({ appName: 'Family Management App' }),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
});
```

### 2. Import Required Dependencies

```typescript
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { familyManagerAbi } from '../../../contract/abis';
import { parseEther } from '../../utils/units';

const FAMILY_MANAGER_ADDRESS = '0x...'; // Your deployed contract address
```

### 3. Add Contract Hooks

```typescript
const TestActions: React.FC = () => {
  // Existing state...
  
  // Contract hooks
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Read contract state
  const { data: isChildRegistered } = useReadContract({
    address: FAMILY_MANAGER_ADDRESS,
    abi: familyManagerAbi,
    functionName: 'isRegisteredChild',
    args: [childAddress as `0x${string}`],
  });
```

### 4. Implement Contract Write Functions

#### Register Child

```typescript
const handleRegisterChild = async () => {
  if (!childAddress) {
    alert('Please enter a child address');
    return;
  }

  try {
    const hash = await writeContract({
      address: FAMILY_MANAGER_ADDRESS,
      abi: familyManagerAbi,
      functionName: 'registerChild',
      args: [childAddress as `0x${string}`],
    });

    addResult({
      action: 'registerChild',
      timestamp: new Date().toISOString(),
      success: true,
      data: { childAddress },
      txHash: hash,
    });
  } catch (error) {
    addResult({
      action: 'registerChild',
      timestamp: new Date().toISOString(),
      success: false,
      error: String(error),
    });
  }
};
```

#### Fund Child

```typescript
const handleFundChildOnChain = async () => {
  if (!fundChildAddress || !fundAmount) {
    alert('Please enter address and amount');
    return;
  }

  try {
    const amountWei = parseEther(fundAmount);
    
    const hash = await writeContract({
      address: FAMILY_MANAGER_ADDRESS,
      abi: familyManagerAbi,
      functionName: 'fundChild',
      args: [fundChildAddress as `0x${string}`, amountWei],
    });

    addResult({
      action: 'fundChild',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        childAddress: fundChildAddress,
        amountEth: fundAmount,
        amountWei: amountWei.toString(),
      },
      txHash: hash,
    });
  } catch (error) {
    addResult({
      action: 'fundChild',
      timestamp: new Date().toISOString(),
      success: false,
      error: String(error),
    });
  }
};
```

#### Unregister Child

```typescript
const handleUnregisterChild = async () => {
  if (!childAddress) {
    alert('Please enter a child address');
    return;
  }

  try {
    const hash = await writeContract({
      address: FAMILY_MANAGER_ADDRESS,
      abi: familyManagerAbi,
      functionName: 'unregisterChild',
      args: [childAddress as `0x${string}`],
    });

    addResult({
      action: 'unregisterChild',
      timestamp: new Date().toISOString(),
      success: true,
      data: { childAddress },
      txHash: hash,
    });
  } catch (error) {
    addResult({
      action: 'unregisterChild',
      timestamp: new Date().toISOString(),
      success: false,
      error: String(error),
    });
  }
};
```

### 5. Add Read Contract Functions

#### Check Child Registration

```typescript
const handleCheckChildRegistration = async () => {
  if (!childAddress) {
    alert('Please enter a child address');
    return;
  }

  try {
    const { data } = await useReadContract({
      address: FAMILY_MANAGER_ADDRESS,
      abi: familyManagerAbi,
      functionName: 'isRegisteredChild',
      args: [childAddress as `0x${string}`],
    });

    addResult({
      action: 'isRegisteredChild',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        childAddress,
        isRegistered: data,
      },
    });
  } catch (error) {
    addResult({
      action: 'isRegisteredChild',
      timestamp: new Date().toISOString(),
      success: false,
      error: String(error),
    });
  }
};
```

#### Get Child Limits

```typescript
const handleGetChildLimits = async () => {
  if (!childAddress) {
    alert('Please enter a child address');
    return;
  }

  try {
    const { data } = await useReadContract({
      address: FAMILY_MANAGER_ADDRESS,
      abi: familyManagerAbi,
      functionName: 'getChildLimits',
      args: [childAddress as `0x${string}`],
    });

    const [daily, weekly, monthly] = data as [bigint, bigint, bigint];

    addResult({
      action: 'getChildLimits',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        childAddress,
        limits: {
          daily: formatEther(daily),
          weekly: formatEther(weekly),
          monthly: formatEther(monthly),
        },
      },
    });
  } catch (error) {
    addResult({
      action: 'getChildLimits',
      timestamp: new Date().toISOString(),
      success: false,
      error: String(error),
    });
  }
};
```

### 6. Add UI Components

```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
    Contract Actions (On-Chain)
  </h2>
  
  <div className="space-y-4">
    {/* Register Child */}
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">Register Child</h3>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Child Address (0x...)"
          value={childAddress}
          onChange={(e) => setChildAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={handleRegisterChild}
          disabled={isPending}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          {isPending ? 'Confirming...' : 'Register Child'}
        </button>
      </div>
    </div>

    {/* Fund Child */}
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">Fund Child (On-Chain)</h3>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Child Address (0x...)"
          value={fundChildAddress}
          onChange={(e) => setFundChildAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Amount in ETH"
          value={fundAmount}
          onChange={(e) => setFundAmount(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={handleFundChildOnChain}
          disabled={isPending || isTxPending}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          {isPending || isTxPending ? 'Processing...' : 'Fund Child'}
        </button>
        {isTxSuccess && (
          <div className="text-green-600 text-sm">
            ✓ Transaction confirmed!
          </div>
        )}
      </div>
    </div>

    {/* Check Registration */}
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">Check Child Registration</h3>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Child Address (0x...)"
          value={childAddress}
          onChange={(e) => setChildAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={handleCheckChildRegistration}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          Check Registration
        </button>
      </div>
    </div>

    {/* Get Limits */}
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">Get Child Limits</h3>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Child Address (0x...)"
          value={childAddress}
          onChange={(e) => setChildAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={handleGetChildLimits}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          Get Limits
        </button>
      </div>
    </div>
  </div>
</div>
```

### 7. Transaction Hash Display Enhancement

Update the results display to link to block explorer:

```tsx
{result.txHash && (
  <div className="mb-2 p-2 bg-white rounded border border-gray-200">
    <div className="text-xs font-semibold text-gray-700 mb-1">
      Transaction Hash:
    </div>
    <div className="text-xs font-mono break-all">
      <a
        href={`https://sepolia.basescan.org/tx/${result.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {result.txHash}
      </a>
    </div>
  </div>
)}
```

## Complete Integration Checklist

- [ ] Install Wagmi and dependencies
- [ ] Setup Wagmi config with Base Sepolia
- [ ] Import FamilyManager ABI
- [ ] Add wallet connection UI
- [ ] Implement contract write functions
- [ ] Implement contract read functions
- [ ] Add transaction status indicators
- [ ] Link transaction hashes to Basescan
- [ ] Handle errors and edge cases
- [ ] Test on Base Sepolia testnet

## Testing on Base Sepolia

1. **Get Testnet ETH**
   - Visit Base Sepolia faucet
   - Fund your test wallet

2. **Deploy Contract** (if not deployed)
   - Deploy FamilyManager contract
   - Note the contract address

3. **Update Configuration**
   - Set `FAMILY_MANAGER_ADDRESS` to deployed address
   - Configure RPC URL in `.env`

4. **Test Flow**
   - Connect wallet
   - Register a child account
   - Fund the child
   - Check limits and status
   - Monitor transactions on Basescan

## Error Handling

Common errors to handle:

```typescript
const handleContractError = (error: any) => {
  let errorMessage = 'Unknown error';
  
  if (error?.message?.includes('User rejected')) {
    errorMessage = 'Transaction rejected by user';
  } else if (error?.message?.includes('insufficient funds')) {
    errorMessage = 'Insufficient funds for transaction';
  } else if (error?.message?.includes('execution reverted')) {
    errorMessage = 'Transaction reverted - check contract requirements';
  }
  
  return errorMessage;
};
```

## Best Practices

1. **Always validate inputs** before sending transactions
2. **Show loading states** during transaction confirmation
3. **Display gas estimates** before user confirms
4. **Handle network switching** gracefully
5. **Cache read contract results** appropriately
6. **Show transaction status** (pending, confirmed, failed)
7. **Link to block explorer** for all transactions
8. **Test with small amounts** first
9. **Implement retry logic** for failed reads
10. **Log errors** for debugging

## Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Base Documentation](https://docs.base.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [Basescan](https://basescan.org/)
