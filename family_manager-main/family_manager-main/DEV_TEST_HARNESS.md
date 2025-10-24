# BaseFam Dev Test Harness

A comprehensive testing interface for manually triggering and testing BaseFam hook actions with live feedback.

## Quick Start

### Access the Test Harness

The test harness is accessible via URL parameters to keep it out of production navigation:

**Option 1: Hash-based routing**
```
http://localhost:5173/#dev
```

**Option 2: Query parameter**
```
http://localhost:5173/?dev=true
```

### First-time Warning

On first access, you'll see a warning dialog:
- Confirms you understand this is a dev-only tool
- Prevents accidental production usage
- Can be dismissed to proceed to the test interface

## Features Overview

### 1. Family Service Actions

Test all family management service methods:

#### Get Family Data
- Click "Load Family Data" to fetch current family state
- View complete family member list and transaction history
- Results show in real-time on the right panel

#### Add Family Member
```
Name: [text input]
Role: [Kid | Mom dropdown]
Spending Limit: [number]
Daily Allowance: [number]
```
- Creates new family member with specified parameters
- For Kids: initial balance = allowance
- Response includes updated family data with new member

#### Update Member Settings
```
Member ID: [e.g., kid-01]
New Spending Limit: [number]
New Daily Allowance: [number]
```
- Modifies existing member's limits and allowances
- Use member IDs from the family data response

#### Revoke Access
```
Member ID: [e.g., mom-01]
```
- Removes family member from the system
- Cannot be undone (in-memory only)

#### Process Daily Allowances
- Distributes daily allowances to all Kids
- Deducts from main wallet balance
- Creates transaction records

### 2. Units Helpers

Test currency conversion utilities with any value:

```
Amount: [e.g., 1.5]
Click: "Test parseUnits/formatUnits"
```

**Returns:**
- Input value (human-readable)
- Parsed Wei value (BigInt string)
- Formatted back (should match input)
- formatEther output

**Available Functions:**
```typescript
parseUnits(value: string, decimals: number = 18): bigint
formatUnits(value: bigint | string | number, decimals: number = 18): string
parseEther(value: string): bigint
formatEther(value: bigint | string | number): string
parseUsdc(value: string): bigint
formatUsdc(value: bigint | string | number): string
```

### 3. Contract Simulation

Simulate blockchain contract interactions:

#### Fund Child (Simulated)
```
Child Address: [0x... address]
Amount in ETH: [number]
```
- Simulates on-chain funding transaction
- Generates mock transaction hash
- Shows amount in both ETH and Wei
- Demonstrates units conversion in action

**Note:** This is a simulation only. For real contract interactions, integrate with Wagmi hooks and the FamilyManager ABI.

## Live Results Panel

The right-side panel displays action results in real-time:

### Success Result
```
✓ Success
getFamilyData
2024-01-15 10:30:45

Response Data:
{
  "mainWalletBalance": 10000,
  "members": [...],
  "transactions": [...]
}
```

### Error Result
```
✗ Error
addFamilyMember
2024-01-15 10:31:20

Error:
Failed to add family member: Invalid role
```

### Transaction Hash (when applicable)
```
Transaction Hash:
0xa1b2c3d4e5f6...
```

### Features:
- ✅ Color-coded by success/failure (green/red)
- 📋 JSON formatting for data inspection
- 🕐 Timestamp for each action
- 🔄 Most recent result appears first
- 🗑️ "Clear" button to reset results

## Use Cases

### Testing Family Management Flow
1. Get Family Data to see initial state
2. Add new Kid member with allowance
3. Process Daily Allowances to fund them
4. Update their spending limits
5. Revoke access when done testing

### Testing Units Conversion
1. Enter various ETH amounts (0.001, 1.5, 100)
2. Test parseUnits/formatUnits
3. Verify Wei conversion accuracy
4. Test edge cases (very small/large numbers)

### Simulating Contract Interactions
1. Enter test wallet address
2. Specify funding amount
3. View simulated transaction hash
4. Inspect Wei conversion

## Integration with Real Contracts

To connect with actual smart contracts:

1. **Import Contract ABI**
   ```typescript
   import { familyManagerAbi } from '../../contract/abis';
   ```

2. **Use Wagmi Hooks**
   ```typescript
   import { useWriteContract, useReadContract } from 'wagmi';
   
   const { writeContract, data: txHash } = useWriteContract();
   
   const fundChild = async () => {
     await writeContract({
       address: CONTRACT_ADDRESS,
       abi: familyManagerAbi,
       functionName: 'fundChild',
       args: [childAddress, parseEther(amount)]
     });
   };
   ```

3. **Display Real Transaction Hashes**
   - Use `txHash` from Wagmi hooks
   - Link to Basescan explorer
   - Show transaction status

## Security Considerations

⚠️ **Important Security Notes:**

1. **No Production Access**: Remove query parameter/hash handling in production builds
2. **No Authentication**: This page has no auth guards
3. **In-Memory Only**: Current implementation doesn't persist to blockchain
4. **Simulated Transactions**: Transaction hashes are randomly generated
5. **Dev Environment**: Only enable in local/staging environments

## File Structure

```
app_design_ui/
├── pages/
│   └── dev/
│       ├── TestActions.tsx    # Main test harness component
│       ├── index.tsx           # Exports
│       └── README.md           # Detailed documentation
├── utils/
│   ├── units.ts                # Currency conversion helpers
│   └── index.ts                # Exports
└── App.tsx                     # Updated with dev mode routing
```

## Extending the Test Harness

### Adding New Service Methods

1. **Add input fields** in TestActions.tsx
2. **Create handler function**:
   ```typescript
   const handleNewAction = async () => {
     try {
       const data = await familyService.newMethod(params);
       addResult({
         action: 'newMethod',
         timestamp: new Date().toISOString(),
         success: true,
         data,
       });
     } catch (error) {
       addResult({
         action: 'newMethod',
         timestamp: new Date().toISOString(),
         success: false,
         error: String(error),
       });
     }
   };
   ```
3. **Add UI section** with button and inputs

### Adding Contract Methods

1. **Import contract ABI and Wagmi hooks**
2. **Create contract interaction handler**
3. **Add form section with required parameters**
4. **Display transaction hash in results**

## Troubleshooting

### "No results yet" shows but actions don't work
- Check browser console for errors
- Verify service methods are imported correctly
- Check network tab for API calls (if using real backend)

### TypeScript errors
- Run `npm run typecheck` to validate
- Ensure all types are imported from `types.ts`

### Build fails
- Run `npm run build` to test production build
- Remove any console.logs or debugging code

## Future Enhancements

Potential additions:
- [ ] Wallet connection testing (Wagmi integration)
- [ ] Real contract method testing on Base Sepolia
- [ ] Transaction status polling
- [ ] Event listener testing
- [ ] Batch operations
- [ ] Export test results as JSON
- [ ] Saved test scenarios
- [ ] Response comparison/diff view
